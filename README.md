# GoogleDrive Image & Video Manager

Manage images and videos using your personal Google Drive storage.

## Prerequisites

To use this tool, you need a Google Cloud Project to access the Google Drive API.

## Used NPM Projects

- `fs`
- `path`
- `process`
- `@google-cloud/local-auth`
- `googleapis`
- `express`
- `https`
- `body-parser`
- `multer`

## Description

This project allows you to upload and download images and videos with e.g. ShareX and store it in your Google Drive.

- `https://i.<domain>.de/<ID>`: Displays the image.
- `https://i.<domain>.de/<ID>/raw`: Displays the raw image.
- `https://v.<domain>.de/<ID>`: Displays the video.
- `https://v.<domain>.de/<ID>/raw`: Displays the raw video.

## Config
data/require/config.json
