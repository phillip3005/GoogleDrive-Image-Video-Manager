const sendFileToUser = require("./sendFileToUser.js")

module.exports = function sendNotFoundPage(res, req) {
    sendFileToUser(res, req, { "identifier": "image", "folderPath": "./data/require/" }, "error.png", true); return
}