module.exports = async function handleFileUploadRequests(req, res, cloud, fileType) {

    if (!req.hostname.startsWith(fileType.subDomain)) return
    if (!req.file) { res.status(400).send('Keine Datei hochgeladen'); return; }

    let filename = req.file.filename
    if (!filename) {
        res.send({ "url": `${req.hostname}/error` });
        return
    }

    res.send({ "url": `https://${req.hostname}/${filename.toString().replace(fileType.alternativeEnding, "")}` });
    cloud.uploadImage(req.file, fileType)
}