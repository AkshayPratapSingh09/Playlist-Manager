import json
import os
import subprocess

def get_watch_later_data(cookie_content, index):
    # Save cookie string to a temp file
    cookie_file = f"temp_cookie_{index}.txt"
    with open(cookie_file, "w") as f:
        f.write(cookie_content)

    # Run yt-dlp to get metadata only (--flat-playlist makes it fast)
    cmd = [
        "yt-dlp",
        "--cookies", cookie_file,
        "--flat-playlist",
        "--dump-single-json",
        "https://www.youtube.com/playlist?list=WL"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(cookie_file): os.remove(cookie_file)
    
    if result.returncode == 0:
        return json.loads(result.stdout).get('entries', [])
    return []

def main():
    cookie_list = json.loads(os.environ.get('COOKIE_DATA', '[]'))
    all_videos = {}

    # Load existing data if it exists
    if os.path.exists("videos.json"):
        with open("videos.json", "r") as f:
            try:
                old_data = json.load(f)
                for v in old_data: all_videos[v['id']] = v
            except: pass

    for i, cookie_text in enumerate(cookie_list):
        print(f"Processing account {i+1}...")
        entries = get_watch_later_data(cookie_text, i)
        for entry in entries:
            if entry:
                all_videos[entry['id']] = {
                    "id": entry.get("id"),
                    "title": entry.get("title"),
                    "url": f"https://www.youtube.com/watch?v={entry.get('id')}",
                    "uploader": entry.get("uploader")
                }

    # Save merged data
    with open("videos.json", "w") as f:
        json.dump(list(all_videos.values()), f, indent=4)

if __name__ == "__main__":
    main()