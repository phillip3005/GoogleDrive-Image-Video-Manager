const ConfigManager = require("../ConfigManager/configManager.js")
const Config = new ConfigManager("/home/ImageServer/data/require/config.json")

const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const fs = require("fs")

module.exports = function cloud() {

    let auth
    let downloadingCacheList = []

    const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', "https://www.googleapis.com/auth/drive"];
    const TOKEN_PATH = path.join(process.cwd(), 'token.json');
    const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

    async function loadSavedCredentialsIfExist() {
        try {
            const content = await fs.promises.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }
    async function saveCredentials(client) {
        const content = await fs.promises.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.promises.writeFile(TOKEN_PATH, payload);
    }

    async function authorize() {
        let client = await loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await saveCredentials(client);
        }
        return client;
    }
    this.getAuth = () => {
        return auth
    }

    this.existFileInCloud = async (fileName, folderId) => {

        return new Promise(async (res, rej) => {
            const drive = google.drive({ version: 'v3', auth });

            const r = await drive.files.list({
                fields: 'files(id, name)',
                q: `'${folderId}' in parents and name='${fileName}' and trashed = false`,
            });

            const files = r.data.files;
            if (!files.length) {
                console.log('No files found.');
                res(false)
            } else if (files.length > 1) {
                console.log('To many files found.');
                res(false)
            } else {
                res(files[0].id)
            }
        })
    }
    this.existFileLocal = (folderPath, fileName) => {
        const exist = fs.existsSync(folderPath + fileName)
        return exist
    }

    this.getLocalFile = (folderPath, fileName) => {
        const file = fs.readFileSync(folderPath + fileName)
        return file
    }

    this.downloadFileFromCloud = (fileId, path, fileName) => {
        return new Promise((res, rej) => {
            const drive = google.drive({ version: 'v3', auth });
            downloadingCacheList.push(fileName)
            drive.files.get({
                fileId: fileId,
                alt: 'media',
                auth
            }, { responseType: 'stream' }, function (error, response) {
                if (error) {
                    console.error('Fehler beim Herunterladen:', error);
                    removeItemFromDownloadingList(fileName, downloadingCacheList)
                    rej(error)
                    return;
                }
                response.data
                    .on('end', async () => {
                        console.log('Herunterladen beendet.');
                        removeLastModifiedFile(path)
                        removeItemFromDownloadingList(fileName, downloadingCacheList)
                        res(true)
                    })
                    .on('error', err => {
                        console.error('Fehler beim Herunterladen:', err);
                        removeItemFromDownloadingList(fileName, downloadingCacheList)
                        rej(error)
                    })
                    .pipe(fs.createWriteStream(path + fileName));
            });
        })
    }
    this.fileAlreadyDownloading = (fileName) => {
        return downloadingCacheList.includes(fileName)
    }

    this.load = () => {
        return new Promise((res, rej) => {
            authorize()
                .then(c => { res(c); auth = c; })
                .catch(err => { console.error(err); rej(err) });
        })
    }

    this.uploadImage = async (file, fileType) => {
        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            'name': file.filename,
            'parents': [fileType.folderId]
        };
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        };

        try {
            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id'
            });

            removeLastModifiedFile(file.destination)
            console.log('File wurde hochgeladen! '+ response.data.id);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

    }
}

function removeItemFromDownloadingList(fileName, downloadingCacheList) {
    let i = downloadingCacheList.indexOf(fileName);
    if (i !== -1) downloadingCacheList.splice(i, 1);
}

function removeLastModifiedFile(directory) {
    const cachesFileAmount = Config.get("cachedFilesAmount")

    let files = fs.readdirSync(directory);
    if (files.length <= cachesFileAmount) return

    let filelist = []
    for (let file of files) {
        filelist.push({ file, lastModified: fs.statSync(directory + file).mtime })
    }

    filelist.sort((a, b) => b.lastModified - a.lastModified);
    filelist.splice(0, cachesFileAmount)

    for (let file of filelist) {
        fs.unlinkSync(directory + file.file);
    }
}