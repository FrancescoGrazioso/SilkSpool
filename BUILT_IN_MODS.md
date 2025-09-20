# Built-in Mods Feature

Silk Spool automatically loads a built-in repository from `silk-spool/public/mods.json`. This feature allows you to ship mandatory mods or default content with the application.

## How it Works

1. **Automatic Loading**: On startup, Silk Spool checks for `mods.json` in the public folder
2. **Built-in Repository**: If found, it's loaded as a special "built-in" repository
3. **Priority**: Built-in mods appear first in the repository list with a "Built-in" badge
4. **Integration**: Built-in mods are included in search results and mod counts

## File Structure

The `mods.json` file follows the standard repository format:

```json
{
  "repo_id": "built-in",
  "name": "Silk Spool Built-in Mods",
  "version": 1,
  "mods": [
    {
      "id": "mod-id",
      "title": "Mod Title",
      "description": "Mod description...",
      "requirements": ["BepInEx"],
      "images": ["https://example.com/image1.jpg"],
      "downloads": [
        {
          "label": "Download v1.0.0",
          "url": "https://example.com/download.zip"
        }
      ],
      "homepage": "https://example.com/mod",
      "authors": ["Author Name"],
      "game_version": "1.0.0",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Development vs Production

### Development
- Edit `silk-spool/public/mods.json` directly
- **Restart the development server** to see changes
- Changes are reflected immediately after restart

### Production
- Edit `mods.json` before building
- **Rebuild the application** to include changes
- Built-in mods are bundled with the app

## Use Cases

1. **Mandatory Mods**: Ship essential mods that users should have
2. **Default Content**: Provide curated mods as starting point
3. **Official Mods**: Include official or recommended mods
4. **Demo Content**: Show example mods for testing

## Benefits

- ✅ **No Network Required**: Built-in mods work offline
- ✅ **Guaranteed Availability**: Always present with the app
- ✅ **Easy Updates**: Update with app releases
- ✅ **User-Friendly**: Clear "Built-in" indicator
- ✅ **Flexible**: Can be empty or contain many mods

## Example Implementation

To add a new built-in mod:

1. Edit `silk-spool/public/mods.json`
2. Add your mod to the `mods` array
3. Restart development server or rebuild
4. The mod will appear in the built-in repository

## Notes

- Built-in repository ID is always `"built-in"`
- Built-in mods are loaded first, before cached repositories
- The repository appears with a green "Built-in" badge
- Built-in mods are included in "All Repositories" view
