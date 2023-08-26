const sendNotFoundPage = require("./sendNotFoundPage.js")

module.exports = async function handleFileRequest(req, res, cloud) {
    sendNotFoundPage(res, req)
}