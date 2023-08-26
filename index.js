const ConfigManager = require("./src/ConfigManager/configManager.js")
const Config = new ConfigManager("/home/ImageServer/data/require/config.json")

const fs = require("fs")
const expressAPI = require("./src/expressAPI.js")
const googleCloud = require("./src/GoogleCloud/googleCloud.js");

async function main() {

    const cloud = new googleCloud()
    await cloud.load()

    const express = new expressAPI.createAPI()

    express.addModule("GET", "/favicon.ico", async (req, res) => { res.send(fs.readFileSync("./data/require/favicon.ico")) })

    const handleFileRequests = require("./src/handleHttpRequests/handleFileRequests.js")
    express.addModule("GET", "/:filename/raw", async (req, res) => { handleFileRequests(req, res, cloud, true); })
    express.addModule("GET", "/:filename", async (req, res) => { handleFileRequests(req, res, cloud, false); })

    const handleMainPageRequests = require("./src/handleHttpRequests/handleMainPageRequests.js")
    express.addModule("GET", "/*", handleMainPageRequests)

    const handleFileUploadRequests = require("./src/handleHttpRequests/handleFileUploadRequests.js")
    for (let fileType of Config.get("fileTypes")) {
        express.addModule("POST-UPLOAD", fileType.expressUploadPath, async (req, res) => { handleFileUploadRequests(req, res, cloud, fileType); })
    }

}
main()