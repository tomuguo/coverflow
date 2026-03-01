# Cover Flow (Static HTML/CSS/JS)

A local, dependency-free album browser inspired by iTunes Cover Flow.

## Run it

### Option 1: open directly
Open `index.html` in your browser.

### Option 2 (recommended): local server
```bash
cd coverflow
python -m http.server 8000
# then open http://localhost:8000
```
Using a server ensures `data.json` loads reliably in all browsers.

## Controls

- **Mouse wheel / trackpad scroll**: move selection left/right
- **Click a cover**: jump to that album
- **Arrow keys**: left/right navigation
- **Search box**: filters by title, artist, album, or year
- **Fullscreen button**: toggles fullscreen view

## Data format (`data.json`)

`data.json` must be an array of objects:

```json
[
  {
    "title": "Track or release title",
    "artist": "Artist name",
    "album": "Album name",
    "year": 2025,
    "coverUrl": "data:image/svg+xml,... or local/remote image URL"
  }
]
```

### Adding entries

1. Open `data.json`
2. Append a new object with all five fields
3. Save and refresh the page

Current sample data includes 10 entries using embedded SVG data URIs (no external image dependencies).

## Concept note: exporting Apple Music album art later

If you later want real Apple Music artwork:

1. Use Apple Music API / MusicKit metadata to collect album + artwork URL templates.
2. Resolve URL templates to specific dimensions (e.g., 600x600).
3. Download/cache selected images into a local folder (or convert to data URIs for full portability).
4. Update `data.json` `coverUrl` fields to point to local files or encoded data URIs.

This keeps the current UI unchanged while swapping the source from synthetic SVG art to real album artwork.
