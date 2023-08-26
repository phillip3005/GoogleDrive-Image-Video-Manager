const fs = require("fs")

module.exports = function sendFileToUser(res, req, fileType, fileName, raw) {

    const filePath = fileType.folderPath + fileName
    if (!filePath) return
    markFileAsModified(filePath)

    switch (fileType.identifier) {

        case "image":
            if (raw) {
                res.setHeader('Content-Type', "image/png")
                res.setHeader('Title', fileName)
                res.send(fs.readFileSync(filePath))

            } else {
                let imagePage = fs.readFileSync("./src/htmlPages/imagePage.html").toString()

                imagePage = imagePage.replace("{PASTETITLEHERE}", fileName)
                imagePage = imagePage.replace("{PASTEIMAGEURLHERE}", `https://${req.hostname}/${fileName}/raw`)
                imagePage = imagePage.replace("{PASTEIMAGEURLHERE}", `https://${req.hostname}/${fileName}/raw`)
                res.send(imagePage);
            }
            break;

        case "video":
            
            if (raw) {
                const videoStat = fs.statSync(filePath);
                const fileSize = videoStat.size;
                const videoRange = req.headers.range;

                if (videoRange) {
                    const parts = videoRange.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunksize = (end - start) + 1;
                    const file = fs.createReadStream(filePath, { start, end });
                    const header = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4',
                    };
                    res.writeHead(206, header);
                    file.pipe(res);

                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4',
                    };
                    res.writeHead(200, head);
                    fs.createReadStream(filePath).pipe(res);
                }

            } else {
                let videoPage = fs.readFileSync("./src/htmlPages/videoPage.html").toString()

                videoPage = videoPage.replace("{PASTETITLEHERE}", fileName)
                videoPage = videoPage.replace("{PASTEVIDEOHERE}", `https://${req.hostname}/${fileName}/raw`)
                res.send(videoPage);
            }
            break;

        default: res.status(200).send("Unknow Subdomain! Please report this!"); break;
    }
}

function markFileAsModified(path) {
    const lastModified = new Date()
    fs.utimesSync(path, lastModified, lastModified);
}