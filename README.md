# GoogleDrive Image & Video Manager

This tool enables automatic downloading of images and videos from your Google Drive, allowing you to conveniently view them. Additionally, it can be used as a custom uploader in conjunction with external applications like ShareX to directly store images and videos in your Google Drive.

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

Default URL Paths:

- `https://i.<domain>.de/<Name>`: Displays the image with custom backround.
- `https://i.<domain>.de/<Name>/raw`: Displays the raw image.
- `https://v.<domain>.de/<Name>`: Displays the video with custom video player.
- `https://v.<domain>.de/<Name>/raw`: Displays the raw video.

_(Uploader URL paths can be configured in the config)_

## Config
data/require/config.json
