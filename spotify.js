const https = require("https");
const fs = require("fs");
const jsdom = require("jsdom");
var SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const app = express();
const { JSDOM } = jsdom;
require("dotenv").config();

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:8888/callback",
});

// Get an authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(["user-read-email"], "state");
// change this to your playlist url
const playlist_url =
  "https://open.spotify.com/playlist/1bmJ3r19mS0jUGb41S15NT?si=60aa58f51c17418e";

async function downloadSong(urls, playlist_name,offset) {
  const promises = urls.map(async (url, i) => {
    https.get(url, async (response) => {
      const contentDisposition = response.headers["content-disposition"];
      var filename;
      if (contentDisposition) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
        filename = filename.substring(18);
      } else {
        filename = `music${Math.random() * 600}.mp3`;
      }
      file = fs.createWriteStream(`./${playlist_name}/` + filename);
      await response.pipe(file);
      response.on("end", () => {
        console.log(i + 1 + offset, "✅", filename);
      });
    });
  });
  await Promise.all(promises);
}

async function getDownloadLinks(links, songs,offset) {
  const dLinks = [];
  const promises = links.map(async (link, i) => {
    const response = await fetch("https://spotifymate.com/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(link)}`,
    });
    const html = await response.text();
    const { window } = new JSDOM(html);
    const abuttons = window.document.querySelectorAll("div.abuttons");
    if (abuttons && abuttons.length > 0) {
      const abutton = abuttons[0];
      const href = abutton.querySelector("a").href;
      dLinks.push(href);
      console.log(i + 1+offset, `✅ ${songs[i]}`);
    }
  });
  await Promise.all(promises);
  return dLinks;
}

async function getPlaylistTracks(playlist_id) {
  const response = await spotifyApi.getPlaylist(playlist_id);
  const playlist_name = response.body.name;
  // create a folder with playlist name if it doesn't exist
  if (!fs.existsSync(playlist_name)) fs.mkdirSync(playlist_name);
  var offset = 0;
  var limit = 100;
  var links = [];
  var songs = [];
  while (true) {
    try {
      var data = await spotifyApi.getPlaylistTracks(playlist_id, {
        offset: offset,
        limit: limit,
      });
      var tracks = data.body.items;
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i].track;
        var name = track.name;
        if (track.external_urls.spotify) {
          var link = track.external_urls.spotify;
          links.push(link);
          songs.push(name);
          console.log(offset + i + 1, name);
        }
      }
      offset += limit;
      if (tracks.length < limit) break;
    } catch (err) {
      console.log(err);
    }
  }
  console.log("====================================");
  console.log("Fetching download links...");
  console.log("====================================");
  const numSongs = songs.length;
  // divide the links into chunks of 20
    var chunks = [];
    for (var i = 0; i < numSongs; i += 20) {
        chunks.push(links.slice(i, i + 20));
    }
    // get download links for each chunk
    var downloadLinks = [];
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        var dLinks = await getDownloadLinks(chunk, songs,i*20);
        downloadLinks = downloadLinks.concat(dLinks);
    }
    // print number of songs downloaded
    console.log("====================================");
    console.log(downloadLinks.length, "links fetched Successfully!");
    console.log("====================================");
    console.log("Starting Download...");
    console.log("====================================");
    // divide the download links into chunks of 20
    var chunks = [];
    for (var i = 0; i < downloadLinks.length; i += 20) {
        chunks.push(downloadLinks.slice(i, i + 20));
    }
    // download each chunk
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        await downloadSong(chunk, playlist_name,i*20);
    }
    console.log("====================================");
    console.log("Download Complete!");
}

var playlist_id = playlist_url.split("/")[4];
playlist_id = playlist_id.split("?")[0];

app.get("/callback", function (req, res) {
  var code = req.query.code || null;
  spotifyApi.authorizationCodeGrant(code).then(
    function (data) {
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
      console.log("====================================");
      console.log("Fetching songs from playlist...");
      console.log("====================================");
      getPlaylistTracks(playlist_id);
      res.send("Success");
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

app.get("/", function (req, res) {
  res.redirect(authorizeURL);
});

app.listen(8888, function () {
  console.log("visit http://localhost:8888");
});
