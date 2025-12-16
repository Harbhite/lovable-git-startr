// Content script to inject GitHub import button into lovable.dev

// State for the popup
let selectedRepo = null;
let importJob = null;
let pollStatusInterval = null;

// Helper to check if an element is a "New Project" or "+" button
function isNewProjectButton(element) {
  if (!element) return false;

  const ariaLabel = element.getAttribute('aria-label') || '';
  if (['new project', 'create project', 'add project', 'new'].some(s => ariaLabel.toLowerCase().includes(s))) {
    return true;
  }

  const text = element.textContent.toLowerCase();
  if (['new project', 'create project'].some(s => text.includes(s))) {
    return true;
  }

  return false;
}

// Create and inject the fixed GitHub import button
function injectFixedGitHubImportButton() {
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

  githubImportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImportPopup();
  });

  document.body.appendChild(githubImportBtn);
}

// Handle clicks to detect "New Project" buttons
function handleGlobalClick(event) {
  const target = event.target.closest('button');
  if (target && isNewProjectButton(target)) {
    setTimeout(injectIntoMenu, 100);
    setTimeout(injectIntoMenu, 500);
  }
}

function injectIntoMenu() {
  const menus = document.querySelectorAll('[role="menu"], [role="dialog"], [class*="menu"], [class*="modal"], [class*="popover"]');
  
  menus.forEach(menu => {
    if (menu.querySelector('#lovable-github-import-menu-item')) return;

    const menuItem = document.createElement('div');
    menuItem.id = 'lovable-github-import-menu-item';
    menuItem.className = 'github-import-menu-item';
    menuItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111 1.02-.227 1.02-.512 0-.285-.01-1.04-.015-2.087-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.203.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.956-.266 1.98-.399 2.995-.404 1.015.005 2.039.138 2.996.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.576 4.764-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span>Import from GitHub</span>
    `;

    menuItem.addEventListener('click', () => {
      showImportPopup();
    });

    menu.appendChild(menuItem);
  });
}

// ---------------------------------------------------------
// POPUP LOGIC (Ported from popup.js)
// ---------------------------------------------------------

function showImportPopup() {
  let overlay = document.getElementById('lovable-github-import-overlay');

  if (!overlay) {
    overlay = createPopupDOM();
    document.body.appendChild(overlay);

    // Bind global events for the popup
    document.getElementById('close-popup').addEventListener('click', closePopup);
    document.getElementById('connect-github-btn').addEventListener('click', connectGitHub);
    document.getElementById('disconnect-btn').addEventListener('click', disconnectGitHub);
    document.getElementById('import-btn').addEventListener('click', startImport);
    document.getElementById('cancel-import-btn').addEventListener('click', cancelImport);
    document.getElementById('view-project-btn').addEventListener('click', viewProject);
    document.getElementById('new-import-btn').addEventListener('click', newImport);
    document.getElementById('repo-search').addEventListener('input', filterRepositories);

    // Close on click outside
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  }

  overlay.style.display = 'flex';
  initPopupState();
}

function createPopupDOM() {
  const div = document.createElement('div');
  div.id = 'lovable-github-import-overlay';
  div.innerHTML = `
    <div id="lovable-github-import-popup">
      <h2>Import from GitHub</h2>
      <button class="close-btn" id="close-popup">×</button>

      <div id="auth-section">
        <p>Connect your GitHub account to import repositories.</p>
        <button id="connect-github-btn" class="btn-primary">Connect with GitHub</button>
      </div>

      <div id="repos-section" style="display: none;">
        <input type="text" id="repo-search" placeholder="Search repositories...">
        <div id="repos-list" style="max-height: 300px; overflow-y: auto;"></div>
        <button id="import-btn" class="btn-primary" disabled>Import Selected Repository</button>
        <button id="disconnect-btn" class="btn-secondary">Disconnect GitHub</button>
      </div>

      <div id="progress-section" style="display: none;">
        <div class="progress-bar">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
        <div class="status-message" id="status-message">Starting import...</div>
        <button id="cancel-import-btn" class="btn-secondary">Cancel Import</button>
      </div>

      <div id="complete-section" style="display: none;">
        <div class="status-message success" id="complete-message">Import completed successfully!</div>
        <button id="view-project-btn" class="btn-primary">View Project</button>
        <button id="new-import-btn" class="btn-secondary">Import Another</button>
      </div>
    </div>
  `;
  return div;
}

function closePopup() {
  const overlay = document.getElementById('lovable-github-import-overlay');
  if (overlay) overlay.style.display = 'none';
  if (pollStatusInterval) clearInterval(pollStatusInterval);
}

function initPopupState() {
  chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
    if (response && response.token) {
      showRepositories(response.token);
    } else {
      showAuthSection();
    }
  });
}

function showAuthSection() {
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('repos-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'none';
}

function showRepositories(token) {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('repos-section').style.display = 'block';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'none';

  const reposList = document.getElementById('repos-list');
  reposList.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

  fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to fetch repos');
    return response.json();
  })
  .then(repos => {
    displayRepositories(repos);
  })
  .catch(error => {
    console.error('Error fetching repositories:', error);
    reposList.innerHTML = '<div class="status-message error">Error fetching repositories. Please try reconnecting.</div>';
  });
}

function displayRepositories(repos) {
  const reposList = document.getElementById('repos-list');
  reposList.innerHTML = '';

  repos.forEach(repo => {
    const repoItem = document.createElement('div');
    repoItem.className = 'repo-item';
    repoItem.innerHTML = `
      <div class="repo-name">${repo.full_name}</div>
      ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
      <div class="repo-owner">${repo.owner.login} • ${repo.stargazers_count} stars</div>
    `;

    repoItem.addEventListener('click', () => {
      document.querySelectorAll('.repo-item').forEach(item => item.classList.remove('selected'));
      repoItem.classList.add('selected');
      selectedRepo = repo;
      document.getElementById('import-btn').disabled = false;
    });

    reposList.appendChild(repoItem);
  });
}

function filterRepositories() {
  const searchTerm = document.getElementById('repo-search').value.toLowerCase();
  const repoItems = document.querySelectorAll('.repo-item');

  repoItems.forEach(item => {
    const repoName = item.querySelector('.repo-name').textContent.toLowerCase();
    const repoDescription = item.querySelector('.repo-description')?.textContent.toLowerCase() || '';

    if (repoName.includes(searchTerm) || repoDescription.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function connectGitHub() {
  // We can't use window.open reliably from content script for auth if strict CSP,
  // but let's try. Ideally this should be initiated by background script.
  // Using the same URL as popup.js
  const width = 800;
  const height = 600;
  const left = (screen.width / 2) - (width / 2);
  const top = (screen.height / 2) - (height / 2);

  const popup = window.open(
    'https://github.com/login/oauth/authorize?client_id=Ov23ctuhgdotRJSuq9KX&scope=repo',
    'GitHub OAuth',
    `width=${width},height=${height},top=${top},left=${left}`
  );

  const pollTimer = setInterval(() => {
    if (popup.closed) {
      clearInterval(pollTimer);
      // Check if authentication was successful
      chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
        if (response && response.token) {
          showRepositories(response.token);
        }
      });
    }
  }, 500);
}

function disconnectGitHub() {
  if (confirm('Are you sure you want to disconnect GitHub?')) {
    chrome.runtime.sendMessage({action: 'clearGitHubToken'}, () => {
      showAuthSection();
    });
  }
}

function startImport() {
  if (!selectedRepo) return;

  document.getElementById('repos-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'block';

  chrome.runtime.sendMessage({
    action: 'startImport',
    repo: selectedRepo,
    branch: 'main'
  });

  pollStatusInterval = setInterval(() => {
    chrome.runtime.sendMessage({action: 'getCurrentImportJob'}, (response) => {
      if (response && response.job) {
        updateProgress(response.job);
        if (response.job.status === 'completed') {
          clearInterval(pollStatusInterval);
          showCompleteSection();
        } else if (response.job.status === 'error') {
          clearInterval(pollStatusInterval);
          showErrorSection(response.job.error);
        }
      }
    });
  }, 1000);
}

function updateProgress(job) {
  const progressFill = document.getElementById('progress-fill');
  const statusMessage = document.getElementById('status-message');

  progressFill.style.width = `${job.progress}%`;
  statusMessage.textContent = job.status;

  statusMessage.className = 'status-message'; // reset
  if (job.status.includes('success') || job.status === 'completed') {
    statusMessage.classList.add('success');
  } else if (job.status.includes('error') || job.status.includes('failed')) {
    statusMessage.classList.add('error');
  }
}

function cancelImport() {
  if (pollStatusInterval) clearInterval(pollStatusInterval);
  alert('Import cancelled');
  showRepositories(selectedRepo ? selectedRepo.owner.login : null); // Just refresh repo list logic
  // Ideally fetch token again to be sure
  chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
    if (response && response.token) showRepositories(response.token);
  });
}

function showCompleteSection() {
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'block';
}

function showErrorSection(error) {
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'block';
  const msg = document.getElementById('complete-message');
  msg.textContent = `Import failed: ${error || 'Unknown error'}`;
  msg.className = 'status-message error';
  document.getElementById('view-project-btn').disabled = true;
}

function viewProject() {
  closePopup();
  // We are already on Lovable, maybe reload or redirect to the dashboard
  window.location.reload();
}

function newImport() {
  selectedRepo = null;
  document.getElementById('repo-search').value = '';
  // Check token again
  chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
    if (response && response.token) showRepositories(response.token);
    else showAuthSection();
  });
}


// Initialize
function init() {
  injectFixedGitHubImportButton();

  const observer = new MutationObserver(() => {
    injectFixedGitHubImportButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', handleGlobalClick, true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
