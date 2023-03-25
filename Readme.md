# Spotify Playlist Downloader
This is a simple script to download all the songs in a Spotify playlist. It uses the Spotify API to get the songs and the spotifymate to download the songs.

## Requirements
* Node.js
* Spotify API Client ID and Client Secret

## Installation
* Clone the repository
* Run `npm install`
* Create a file called `.env` in the root directory of the project
* Add the following to the `.env` file
```bash
CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_SECRET
```
* Change the `playlist_url` variable in `spotify.js` line number `19` to the link of the playlist you want to download
* Run `node spotify.js`
* Go to `http://localhost:8888` in your browser
* Login to your Spotify account
* Click on `Allow` to give the app permission to access your account
* After a successful login, the songs will be downloaded to the `playlist_name` directory

## Warning
* It may happen that not all the songs are downloaded. This is because some songs are not available on Spotify. The script will still continue to download the songs that are available. If you are lucky, you will get all the songs in the playlist😅.
* The script will download the songs at bitrate 128kbps.
* The order of the songs in the downloaded playlist may not be the same as the order in the playlist.