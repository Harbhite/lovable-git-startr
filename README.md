# Lovable GitHub Import Extension

A Chrome extension that enables importing existing GitHub repositories into Lovable.dev as new projects.

## Overview

Lovable.dev does not natively support importing existing GitHub repositories. This extension provides a workaround by automating the process of creating a blank project, connecting it to GitHub, and replacing the generated code with your existing repository.

## Features

- **GitHub Authentication**: Secure OAuth integration with GitHub
- **Repository Selection**: Browse and search your GitHub repositories
- **Automated Import**: One-click import of repositories into Lovable
- **Progress Tracking**: Real-time status updates during import
- **Error Handling**: Clear error messages and retry functionality

## Installation

### Manual Installation

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to `chrome://extensions` in Chrome
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `lovable-github-import` directory

2. **Using the Extension**
   - Navigate to [lovable.dev](https://lovable.dev)
   - Click the "Import from GitHub" button that appears next to the "Get started" button
   - Connect your GitHub account
   - Select a repository to import
   - Click "Import Selected Repository"
   - Wait for the import to complete

## How It Works

The extension automates the following workflow:

1. **Create Blank Project**: Creates a new project in Lovable with a placeholder prompt
2. **Connect to GitHub**: Connects the project to GitHub (creates a new repository)
3. **Clone Repository**: Clones the Lovable-created repository locally
4. **Replace Files**: Deletes generated files and copies your existing repository files
5. **Commit and Push**: Commits and pushes the changes to GitHub
6. **Sync**: Lovable automatically syncs the new code

## Technical Details

### Extension Architecture

- **Manifest v3**: Modern Chrome extension manifest
- **Content Script**: Injects UI elements into lovable.dev
- **Background Script**: Manages extension state and coordinates import workflow
- **Popup Interface**: User-friendly interface for repository selection
- **GitHub API**: OAuth authentication and repository management

### Files

- `manifest.json` - Extension configuration
- `scripts/content.js` - Content script for injecting UI
- `scripts/content.css` - CSS for styling
- `scripts/background.js` - Background service worker
- `popup/popup.html` - Popup interface HTML
- `popup/popup.js` - Popup JavaScript logic
- `icons/` - Extension icons

## Requirements

- Google Chrome (version 88 or later)
- GitHub account
- Lovable.dev account

## Security

- GitHub tokens are stored securely using Chrome storage
- OAuth authentication ensures secure access
- No sensitive data is stored locally
- All operations require explicit user confirmation

## Troubleshooting

### Import fails

- Ensure you have a valid GitHub token
- Check that the repository exists and is accessible
- Verify that you have write permissions for the repository
- Try refreshing the page and retrying

### Button doesn't appear

- Ensure the extension is enabled
- Try refreshing the lovable.dev page
- Check the browser console for errors

### Repository not found

- Ensure the repository is public or you have access
- Try searching for the repository name
- Verify your GitHub authentication

## Limitations

- This is a workaround, not a native feature
- Requires manual setup of GitHub OAuth (client ID needed)
- May not work if Lovable changes their UI significantly
- Limited error handling for edge cases

## Future Improvements

- Better error handling and recovery
- Support for importing from specific branches
- Batch import of multiple repositories
- Integration with Lovable's API (if available)
- Better progress tracking and logging

## License

This extension is provided as-is for personal use.

## Support

For issues or questions, please open an issue on the repository.

---

**Note**: This extension uses a workaround method since Lovable.dev does not natively support GitHub repository imports. The official Lovable documentation confirms this limitation.
