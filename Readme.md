# Spotify Playlist Downloader
This is a simple script to download all the songs in a Spotify playlist. It uses the Spotify API to get the songs and the spotifymate to download the songs.

## Requirements
* Python 3
* Spotify API Client ID and Client Secret 
    - You can get these by creating an app on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
    - Make sure to add `http://localhost:8888` to the Redirect URIs
    
## Installation
* Clone the repository
* Run `python -m venv env`
* Run `env\Scripts\activate.bat` (Windows) or `source env/bin/activate` (Linux)
* Run `pip install -r requirements.txt`
* Open `spotify.py` in a text editor, and add your Client ID and Client Secret to the `client_id` and `client_secret` variables on lines 5 and 6
* Run `python spotify.py`
* You will be asked to enter the URL of the playlist you want to download
* Enter the URL and press enter
* You will be asked to login to your Spotify account first time you run the script
* After a successful login, the songs will be downloaded to the `playlist_name` directory
* You can see the progress of the download in the terminal

## General Points
* The script will download the songs at bitrate 128kbps.
* The order of the songs in the downloaded playlist may not be the same as the order in the playlist.
* It may happen that not all the songs are downloaded. This is because some songs are not available on Spotify. The script will still continue to download the songs that are available. If you are lucky, you will get all the songs in the playlist😅.

## Happy Downloading!🎉

