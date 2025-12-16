# Lovable GitHub Import Extension - Installation Guide

## Prerequisites

Before installing the extension, ensure you have the following:

- **Google Chrome** browser (version 88 or later)
- **GitHub account** with at least one repository
- **Lovable.dev account** (free or paid)

## Installation Steps

### Step 1: Download the Extension

The extension files are included in this package. You should have received:

- `lovable-github-import/` - The extension directory
- `lovable-github-import.zip` - Zipped extension package

### Step 2: Install in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions` in the address bar and press Enter
   - Alternatively, click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner
   - This will reveal additional options

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the `lovable-github-import` directory
   - Select the directory and click "Open"

4. **Verify Installation**
   - The extension should appear in your extensions list
   - Ensure the toggle switch is enabled
   - You should see the extension icon in the Chrome toolbar

### Step 3: Using the Extension

1. **Navigate to Lovable.dev**
   - Go to [https://lovable.dev](https://lovable.dev)
   - Log in to your account if not already logged in

2. **Locate the Import Button**
   - Look for the "Import from GitHub" button
   - It should appear next to the "Get started" button
   - The button has a GitHub icon (black cat/octocat)

3. **Connect GitHub Account**
   - Click the "Import from GitHub" button
   - Click "Connect with GitHub" in the popup
   - Authorize the extension to access your GitHub account
   - Note: You'll need to set up OAuth credentials (see below)

4. **Select a Repository**
   - Browse or search your GitHub repositories
   - Click on the repository you want to import
   - The selected repository will be highlighted

5. **Start Import**
   - Click "Import Selected Repository"
   - The extension will create a new project in Lovable
   - It will connect the project to GitHub
   - It will replace the generated code with your repository
   - Wait for the import to complete (progress bar will show status)

6. **Complete**
   - Once complete, click "View Project"
   - Your project will open in Lovable with your GitHub code
   - Lovable will automatically sync the code

## Setting Up GitHub OAuth

**Important**: The extension requires GitHub OAuth credentials to work properly.

### Option 1: Use Your Own GitHub OAuth App

1. **Create a GitHub OAuth App**
   - Go to [https://github.com/settings/developers](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: `Lovable GitHub Import`
     - Homepage URL: `https://lovable.dev`
     - Authorization callback URL: `https://lovable.dev`
   - Click "Register application"

2. **Get Client ID and Secret**
   - After creating the app, you'll see the Client ID and Client Secret
   - Copy these values

3. **Update the Extension**
   - Open `popup/popup.js` in the extension directory
   - Find the line with `YOUR_CLIENT_ID`
   - Replace it with your actual Client ID
   - Save the file

4. **Reload the Extension**
   - Go back to `chrome://extensions`
   - Click "Reload" on the Lovable GitHub Import extension

### Option 2: Manual OAuth Flow

If you don't want to create an OAuth app, you can use the manual flow:

1. **Get a Personal Access Token**
   - Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Select the following scopes:
     - `repo` - Full control of private repositories
   - Generate the token
   - Copy the token (you won't see it again)

2. **Use the Token in the Extension**
   - The extension will prompt you to enter the token
   - Paste the token when prompted

## Troubleshooting

### The Import Button Doesn't Appear

- **Refresh the page**: Press F5 or Ctrl+R
- **Check extension is enabled**: Go to `chrome://extensions` and ensure the toggle is on
- **Check console for errors**: Press F12 and look for errors in the Console tab
- **Try a different page**: Navigate to a different section of lovable.dev

### Import Fails

- **Check GitHub token**: Ensure your token is valid and has the correct permissions
- **Verify repository exists**: Make sure the repository is public or you have access
- **Check write permissions**: Ensure you have write access to the repository
- **Try again**: Sometimes network issues cause temporary failures

### Repository Not Found

- **Search for the name**: Use the search box to find your repository
- **Check spelling**: Ensure you're searching for the correct repository name
- **Verify GitHub connection**: Disconnect and reconnect your GitHub account

### Extension Crashes

- **Reload the extension**: Go to `chrome://extensions` and click "Reload"
- **Check for updates**: Ensure you're using the latest version
- **Clear cache**: Clear Chrome's cache and try again

## Uninstallation

To uninstall the extension:

1. Go to `chrome://extensions`
2. Find "Lovable GitHub Import" in the list
3. Click the trash can icon or "Remove"
4. Confirm the removal

## Support

For issues or questions:

- Check the README.md for more information
- Review the troubleshooting section above
- If problems persist, consider creating a GitHub issue (if this were a public repository)

## Notes

- This extension uses a workaround method since Lovable.dev does not natively support GitHub imports
- The extension automates the process of creating a blank project and replacing the code
- All operations require explicit user confirmation
- GitHub tokens are stored securely using Chrome's storage API
- The extension does not store any sensitive data locally

---

**Version**: 1.0.0  
**Last Updated**: December 2025
