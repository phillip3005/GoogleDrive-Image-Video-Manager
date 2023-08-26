const fs = require("fs")

module.exports = function sendWaitingPage(res) {
    const waitingPage = fs.readFileSync("./src/htmlPages/waitingPage.html").toString()
    res.status(200).send(waitingPage)
}