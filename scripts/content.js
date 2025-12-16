// Content script to inject GitHub import button into lovable.dev

// Wait for the page to load completely
function waitForElement(selector, callback, timeout = 5000) {
  if (document.querySelector(selector)) {
    callback();
  } else {
    setTimeout(() => {
      waitForElement(selector, callback, timeout - 100);
    }, 100);
  }
}

// Create and inject the GitHub import button
function injectGitHubImportButton() {
  // Check if button already exists
  if (document.querySelector('#lovable-github-import-btn')) {
    return;
  }

  // Find the target location - near the Get started button
  const getStartedButton = document.querySelector('button[id*="signup-link"], button:contains("Get started")');
  
  if (getStartedButton) {
    // Create the GitHub import button
    const githubImportBtn = document.createElement('button');
    githubImportBtn.id = 'lovable-github-import-btn';
    githubImportBtn.className = 'github-import-button';
    githubImportBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111 1.02-.227 1.02-.512 0-.285-.01-1.04-.015-2.087-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.203.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.956-.266 1.98-.399 2.995-.404 1.015.005 2.039.138 2.996.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.576 4.764-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      Import from GitHub
    `;

    // Insert the button before the Get started button
    getStartedButton.parentNode.insertBefore(githubImportBtn, getStartedButton);

    // Add click event handler
    githubImportBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'showPopup'});
    });

    console.log('GitHub Import button injected into Lovable.dev');
  }
}

// Wait for the page to load and inject the button
waitForElement('button[id*="signup-link"], button:contains("Get started")', injectGitHubImportButton);

// Also inject when the page changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      injectGitHubImportButton();
    }, 500);
  }
}).observe(document, {subtree: true, childList: true});
