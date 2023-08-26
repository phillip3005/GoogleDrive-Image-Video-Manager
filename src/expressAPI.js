const ConfigManager = require("./ConfigManager/configManager.js")
const Config = new ConfigManager("/home/ImageServer/data/require/config.json")

const fs = require("fs")
const express = require("express");
const https = require('https');
const bodyParser = require("body-parser");
const multer = require('multer');

function createAPI() {

    const router = express.Router();
    const app = express();

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const subDomain = req.hostname.split(".")[0].toString()
            const fileType = Config.get("fileTypes").find(e => e.subDomain == subDomain)
            const path = fileType ? fileType.folderPath : Config.get("defaultUploadpath")
            cb(null, path);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    const upload = multer({ storage: storage });

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({
        verify: function (req, res, buf) {
            req.rawBody = buf.toString();
        }
    }));

    app.use("/", router);

    const httpspath = Config.get("httpsPath")
    const options = {
        key: fs.readFileSync(`${httpspath}/privkey.pem`),
        cert: fs.readFileSync(`${httpspath}/fullchain.pem`)
    };

    const server = https.createServer(options, app);
    server.listen(443, () => {
        console.log('Server is running!');
    });


    this.addModule = (type, path, f) => {

        switch (type) {
            case "GET":
                router.get(path, (request, response) => { f(request, response) });
                break;

            case "POST":
                router.post(path, (request, response) => { f(request, response) });
                break;

            case "PUT":
                router.put(path, (request, response) => { f(request, response) });
                break;

            case "DELETE":
                router.delete(path, (request, response) => { f(request, response,) });
                break;

            case "POST-UPLOAD":
                router.post(path, upload.single("file"), (request, response) => { f(request, response) });
                break;

        }
        return this

    }
    return this

}

module.exports = { createAPI }