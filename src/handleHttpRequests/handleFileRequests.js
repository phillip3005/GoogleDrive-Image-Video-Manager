const ConfigManager = require("../ConfigManager/configManager.js")
const Config = new ConfigManager("/home/ImageServer/data/require/config.json")

const sendNotFoundPage = require("./sendNotFoundPage.js")
const sendFileToUser = require("./sendFileToUser.js")
const sendWaitingPage = require("./sendWaitingPage.js")

module.exports = async function handleFileRequest(req, res, cloud, raw) {

    const domainParts = req.hostname.split(".")
    if (domainParts == 1) return;

    const subDomain = domainParts[0].toString().toLowerCase()
    const fileType = Config.get("fileTypes").find(e => e.subDomain == subDomain)
    if (!fileType) return

    let fileName = req.params.filename
    if (fileName.includes("\\" || fileName.includes(".."))) { // security Stuff
        sendNotFoundPage(res, req); return
    }

    if (!fileName.includes(".")) fileName += fileType.alternativeEnding
    if (fileName.length <= 5) { sendNotFoundPage(res, req); return }

    if (Object.keys(req.headers).length < 5) raw = true // Discord Headers for better preview

    switch (fileType.identifier) {

        case "image":
            if (cloud.existFileLocal(fileType.folderPath, fileName) && !cloud.fileAlreadyDownloading(fileName)) {
                sendFileToUser(res, req, fileType, fileName, raw)

            } else {
                cloudFileId = await cloud.existFileInCloud(fileName, fileType.folderId)
                if (!cloudFileId) {
                    sendNotFoundPage(res, req);
                    return
                }

                await cloud.downloadFileFromCloud(cloudFileId, fileType.folderPath, fileName)
                sendFileToUser(res, req, fileType, fileName, raw)
            }
            break;

        case "video":
            if (cloud.existFileLocal(fileType.folderPath, fileName) && !cloud.fileAlreadyDownloading(fileName)) {
                sendFileToUser(res, req, fileType, fileName, raw);

            } else if (cloud.fileAlreadyDownloading(fileName)) {
                sendWaitingPage(res, req)

            } else {
                cloudFileId = await cloud.existFileInCloud(fileName, fileType.folderId)
                if (!cloudFileId) {
                    sendNotFoundPage(res, req);
                    return
                }

                sendWaitingPage(res, req)
                cloud.downloadFileFromCloud(cloudFileId, fileType.folderPath, fileName)
            }
            break;

        default:
            sendNotFoundPage(res, req);
            break;
    }

}