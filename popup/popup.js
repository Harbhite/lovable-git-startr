// Popup script for handling user interactions

let selectedRepo = null;
let importJob = null;

// Initialize popup
function init() {
  // Check if GitHub is connected
  chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
    if (response.token) {
      // Show repositories
      showRepositories(response.token);
    } else {
      // Show auth section
      showAuthSection();
    }
  });

  // Add event listeners
  document.getElementById('connect-github-btn').addEventListener('click', connectGitHub);
  document.getElementById('disconnect-btn').addEventListener('click', disconnectGitHub);
  document.getElementById('import-btn').addEventListener('click', startImport);
  document.getElementById('cancel-import-btn').addEventListener('click', cancelImport);
  document.getElementById('view-project-btn').addEventListener('click', viewProject);
  document.getElementById('new-import-btn').addEventListener('click', newImport);
  document.getElementById('close-popup').addEventListener('click', closePopup);
  document.getElementById('repo-search').addEventListener('input', filterRepositories);
}

// Show authentication section
function showAuthSection() {
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('repos-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'none';
}

// Show repositories section
function showRepositories(token) {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('repos-section').style.display = 'block';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'none';

  // Fetch repositories
  fetch('https://api.github.com/user/repos?per_page=100', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  .then(response => response.json())
  .then(repos => {
    displayRepositories(repos);
  })
  .catch(error => {
    console.error('Error fetching repositories:', error);
    document.getElementById('status-message').textContent = 'Error fetching repositories';
    document.getElementById('status-message').className = 'status-message error';
  });
}

// Display repositories
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
      // Select repository
      document.querySelectorAll('.repo-item').forEach(item => item.classList.remove('selected'));
      repoItem.classList.add('selected');
      selectedRepo = repo;
      document.getElementById('import-btn').disabled = false;
    });

    reposList.appendChild(repoItem);
  });
}

// Filter repositories
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

// Connect GitHub
function connectGitHub() {
  // Open GitHub OAuth popup
  const popup = window.open(
    'https://github.com/login/oauth/authorize?client_id=Ov23ctuhgdotRJSuq9KX&scope=repo',
    'GitHub OAuth',
    'width=800,height=600'
  );

  // Listen for OAuth completion
  const pollTimer = setInterval(() => {
    if (popup.closed) {
      clearInterval(pollTimer);
      // Check if authentication was successful
      chrome.runtime.sendMessage({action: 'getGitHubToken'}, (response) => {
        if (response.token) {
          showRepositories(response.token);
        }
      });
    }
  }, 500);
}

// Disconnect GitHub
function disconnectGitHub() {
  if (confirm('Are you sure you want to disconnect GitHub?')) {
    chrome.runtime.sendMessage({action: 'clearGitHubToken'}, () => {
      showAuthSection();
    });
  }
}

// Start import
function startImport() {
  if (!selectedRepo) return;

  document.getElementById('repos-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'block';

  chrome.runtime.sendMessage({
    action: 'startImport',
    repo: selectedRepo,
    branch: 'main'
  });

  // Poll for status updates
  const pollStatus = setInterval(() => {
    chrome.runtime.sendMessage({action: 'getCurrentImportJob'}, (response) => {
      if (response.job) {
        updateProgress(response.job);
        if (response.job.status === 'completed') {
          clearInterval(pollStatus);
          showCompleteSection();
        } else if (response.job.status === 'error') {
          clearInterval(pollStatus);
          showErrorSection(response.job.error);
        }
      }
    });
  }, 1000);
}

// Update progress
function updateProgress(job) {
  const progressFill = document.getElementById('progress-fill');
  const statusMessage = document.getElementById('status-message');

  progressFill.style.width = `${job.progress}%`;
  statusMessage.textContent = job.status;

  if (job.status.includes('success')) {
    statusMessage.className = 'status-message success';
  } else if (job.status.includes('error')) {
    statusMessage.className = 'status-message error';
  } else {
    statusMessage.className = 'status-message';
  }
}

// Cancel import
function cancelImport() {
  // Implementation would send a cancel message to background script
  alert('Import cancelled');
  showRepositories();
}

// Show complete section
function showCompleteSection() {
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'block';
}

// Show error section
function showErrorSection(error) {
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('complete-section').style.display = 'block';
  document.getElementById('complete-message').textContent = `Import failed: ${error}`;
  document.getElementById('complete-message').className = 'status-message error';
  document.getElementById('view-project-btn').disabled = true;
}

// View project
function viewProject() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, {url: 'https://lovable.dev'});
    }
  });
  closePopup();
}

// New import
function newImport() {
  selectedRepo = null;
  document.getElementById('repo-search').value = '';
  showRepositories();
}

// Close popup
function closePopup() {
  window.close();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
