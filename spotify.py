import spotipy,os,requests,re
from spotipy.oauth2 import SpotifyOAuth
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
client_ID = 'YOUR CLIENT ID'
client_Secret = 'YOUR CLIENT SECRET'    

# utility functions
def get_download_link(link,song,count):
    res = requests.post("https://spotifymate.com/action", data={"url": link})
    soup = BeautifulSoup(res.text, 'html.parser')
    abuttons = soup.find_all('div', class_='abuttons')
    if len(abuttons) == 0:
        print(str(count)+" ❌ "+song)
        return None
    href = abuttons[0].find('a')['href']
    print(str(count)+" ✅ "+song)
    return href
def get_download_links(links,songs):
    with ThreadPoolExecutor(max_workers=20) as executor:
        d_links = list(executor.map(get_download_link, links,songs, range(1,len(links)+1)))
    d_links = [x for x in d_links if x]
    return d_links
def download_song_util(url):
    try:
        response = requests.get(url)
        content_disposition = response.headers['Content-Disposition']
        if content_disposition:
            filename = content_disposition.split('filename=')[1].replace('"', '')
            filename = filename[18:]
            invalid_chars = r'[<>:"/\\|?*]'
            filename = re.sub(invalid_chars, '', filename)
        else:
            filename = f"music{int(os.urandom(1)[0]*600)}.mp3"
        with open(os.path.join(playlist_name, filename), "wb") as file:
            file.write(response.content)
        print(f"Downloaded ✅ {filename}")
    except Exception as e:
        print(e)
        print("Error downloading song"+filename)
def download_song(urls):
    with ThreadPoolExecutor(max_workers=20) as executor:
        executor.map(download_song_util, urls)    
def get_links(sp, playlist_id):
    links = []
    songs = []
    offset = 0
    count=0
    limit = 100
    while True:
        results = sp.playlist_items(playlist_id, offset=offset, limit=limit)

        for item in results['items']:
            count+=1
            track = item['track']
            ext_urls = track['external_urls']
            if 'spotify' in ext_urls:
                songs.append(track['name'])
                print(str(count)+" ✅ "+track['name'])
                links.append(ext_urls['spotify'])

        offset += limit
        if results['next'] is None:
            break
    return links,songs

# Authenticate and get access token
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_ID,client_secret=client_Secret,redirect_uri='http://localhost:8888/callback',scope='playlist-read-private'))

# Get playlist details

playlist_url = input("Enter the playlist url: ")
playlist_id = playlist_url.split("/")[-1]
playlist_id = playlist_id.split("?")[0]
playlist = sp.playlist(playlist_id)
playlist_name = playlist['name']
# create a folder with the playlist name if it doesn't exist
if not os.path.exists(playlist_name):
    os.mkdir(playlist_name)

print("=================================================")
print("Playlist Name: " + playlist_name)
print("=================================================")

links,songs = get_links(sp, playlist_id)

print("=================================================")
print(str(len(links)) + " songs found in the playlist")
print("Fetching download links...")
print("=================================================")

d_links = get_download_links(links,songs)
playlist_namee = playlist_name
print("=================================================")
print("Starting download...")
print("=================================================")

download_song(d_links)
        