const fs = require("fs")

module.exports = function sendRawFileToUser(res, req, fileType, fileName) {

    const filePath = fileType.folderPath + fileName
    markFileAsModified(filePath)

    switch (fileType.identifier) {

        case "image":
            res.setHeader('Content-Type', "image/png")
            res.setHeader('Title', fileName)
            res.send(fs.readFileSync(filePath))
            break;

        case "video":
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
            break;
    }
}

function markFileAsModified(path) {
    const lastModified = new Date()
    fs.utimesSync(path, lastModified, lastModified);
}