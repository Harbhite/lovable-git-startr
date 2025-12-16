// Content script to inject GitHub import button into lovable.dev

// Helper to check if an element is a "New Project" or "+" button
// Since we don't have the exact selector, we'll try to guess based on common patterns
function isNewProjectButton(element) {
  if (!element) return false;

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label') || '';
  if (['new project', 'create project', 'add project', 'new'].some(s => ariaLabel.toLowerCase().includes(s))) {
    return true;
  }

  // Check text content
  const text = element.textContent.toLowerCase();
  if (['new project', 'create project'].some(s => text.includes(s))) {
    return true;
  }

  // Check if it's a generic button with just a plus sign (often SVG)
  // This is risky as it might be any add button, but we can try to be specific to the header if possible
  // For now, we will rely on the fixed button as the primary method

  return false;
}

// Create and inject the fixed GitHub import button
function injectFixedGitHubImportButton() {
  // Check if button already exists
  if (document.getElementById('lovable-github-import-fixed-btn')) {
    return;
  }

  const githubImportBtn = document.createElement('button');
  githubImportBtn.id = 'lovable-github-import-fixed-btn';
  githubImportBtn.className = 'github-import-fixed-button';
  githubImportBtn.title = 'Import from GitHub';
  githubImportBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111 1.02-.227 1.02-.512 0-.285-.01-1.04-.015-2.087-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.203.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.956-.266 1.98-.399 2.995-.404 1.015.005 2.039.138 2.996.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.576 4.764-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    <span>Import from GitHub</span>
  `;

  // Add click event handler
  githubImportBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering other page clicks
    chrome.runtime.sendMessage({action: 'showPopup'});
  });

  document.body.appendChild(githubImportBtn);
  console.log('Fixed GitHub Import button injected into Lovable.dev');
}

// Function to handle clicks and try to inject into menus
function handleGlobalClick(event) {
  // If the user clicked a "New Project" button, wait for the menu/modal to appear and inject our button
  const target = event.target.closest('button');
  if (target && isNewProjectButton(target)) {
    console.log('New project button clicked, looking for menu...');
    // Wait briefly for the menu to open
    setTimeout(() => {
      injectIntoMenu();
    }, 100);
    setTimeout(() => {
      injectIntoMenu();
    }, 500);
  }
}

function injectIntoMenu() {
  // Look for common menu/modal containers
  // This is heuristic-based since we don't have the exact selectors
  const menus = document.querySelectorAll('[role="menu"], [role="dialog"], [class*="menu"], [class*="modal"], [class*="popover"]');
  
  menus.forEach(menu => {
    if (menu.querySelector('#lovable-github-import-menu-item')) return;

    // Create a menu item version of the button
    const menuItem = document.createElement('div');
    menuItem.id = 'lovable-github-import-menu-item';
    menuItem.className = 'github-import-menu-item'; // We'll style this to look like a menu item
    menuItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111 1.02-.227 1.02-.512 0-.285-.01-1.04-.015-2.087-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.203.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.956-.266 1.98-.399 2.995-.404 1.015.005 2.039.138 2.996.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.576 4.764-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span>Import from GitHub</span>
    `;

    menuItem.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'showPopup'});
    });

    // Try to append to the end of the menu
    menu.appendChild(menuItem);
  });
}

// Initialize
function init() {
  injectFixedGitHubImportButton();

  // Re-inject if removed (SPA navigation)
  const observer = new MutationObserver(() => {
    injectFixedGitHubImportButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for clicks to handle the "+" button case
  document.addEventListener('click', handleGlobalClick, true);
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
