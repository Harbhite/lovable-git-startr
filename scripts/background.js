// Background script for managing extension state and communication

// Store GitHub token and user data
let githubToken = null;
let githubUser = null;
let currentImportJob = null;

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'showPopup':
      // Open the popup
      chrome.action.openPopup();
      sendResponse({success: true});
      break;

    case 'getGitHubToken':
      sendResponse({token: githubToken, user: githubUser});
      break;

    case 'setGitHubToken':
      githubToken = request.token;
      githubUser = request.user;
      chrome.storage.local.set({
        githubToken: githubToken,
        githubUser: githubUser
      });
      sendResponse({success: true});
      break;

    case 'clearGitHubToken':
      githubToken = null;
      githubUser = null;
      chrome.storage.local.remove(['githubToken', 'githubUser']);
      sendResponse({success: true});
      break;

    case 'startImport':
      startImportProcess(request.repo, request.branch);
      sendResponse({success: true});
      break;

    case 'getCurrentImportJob':
      sendResponse({job: currentImportJob});
      break;

    case 'updateImportStatus':
      updateImportStatus(request.status, request.progress);
      sendResponse({success: true});
      break;

    default:
      sendResponse({success: false, error: 'Unknown action'});
  }
  return true;
});

// Initialize from storage
chrome.storage.local.get(['githubToken', 'githubUser'], (result) => {
  if (result.githubToken) {
    githubToken = result.githubToken;
    githubUser = result.githubUser;
  }
});

// Start the import process
function startImportProcess(repo, branch) {
  currentImportJob = {
    repo: repo,
    branch: branch || 'main',
    status: 'starting',
    progress: 0,
    steps: [
      {name: 'create_project', completed: false},
      {name: 'connect_github', completed: false},
      {name: 'clone_repo', completed: false},
      {name: 'replace_files', completed: false},
      {name: 'commit_push', completed: false},
      {name: 'complete', completed: false}
    ]
  };

  updateImportStatus('Creating new Lovable project...', 10);

  // Notify content script to create a new project
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: createLovableProject,
        args: [repo.full_name]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          updateImportStatus('Project created successfully', 30);
          currentImportJob.steps[0].completed = true;
          
          // Connect to GitHub
          connectToGitHub(repo.full_name);
        } else {
          updateImportStatus('Failed to create project', 0, 'error');
          currentImportJob = null;
        }
      });
    }
  });
}

// Connect the project to GitHub
function connectToGitHub(repoName) {
  updateImportStatus('Connecting project to GitHub...', 40);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: connectGitHub,
        args: [repoName]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          updateImportStatus('Connected to GitHub', 50);
          currentImportJob.steps[1].completed = true;
          
          // Clone the repository
          cloneRepository(repoName);
        } else {
          updateImportStatus('Failed to connect to GitHub', 0, 'error');
          currentImportJob = null;
        }
      });
    }
  });
}

// Clone the repository
function cloneRepository(repoName) {
  updateImportStatus('Cloning repository...', 60);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: cloneRepo,
        args: [repoName, githubToken]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          updateImportStatus('Repository cloned', 70);
          currentImportJob.steps[2].completed = true;
          
          // Replace files
          replaceFiles(repoName);
        } else {
          updateImportStatus('Failed to clone repository', 0, 'error');
          currentImportJob = null;
        }
      });
    }
  });
}

// Replace files in the repository
function replaceFiles(repoName) {
  updateImportStatus('Replacing files...', 80);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: replaceRepoFiles,
        args: [repoName, githubToken]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          updateImportStatus('Files replaced', 90);
          currentImportJob.steps[3].completed = true;
          
          // Commit and push
          commitAndPush(repoName);
        } else {
          updateImportStatus('Failed to replace files', 0, 'error');
          currentImportJob = null;
        }
      });
    }
  });
}

// Commit and push changes
function commitAndPush(repoName) {
  updateImportStatus('Committing and pushing changes...', 95);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: commitPush,
        args: [repoName, githubToken]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          updateImportStatus('Import completed successfully!', 100, 'success');
          currentImportJob.steps[4].completed = true;
          currentImportJob.steps[5].completed = true;
          currentImportJob.status = 'completed';
          
          // Notify user
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
              chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: showSuccessMessage
              });
            }
          });
        } else {
          updateImportStatus('Failed to commit and push', 0, 'error');
          currentImportJob = null;
        }
      });
    }
  });
}

// Update import status
function updateImportStatus(status, progress, type = 'info') {
  if (currentImportJob) {
    currentImportJob.status = status;
    currentImportJob.progress = progress;
    
    // Broadcast status to popup
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: updatePopupStatus,
          args: [status, progress, type]
        });
      }
    });
  }
}

// Helper functions to be executed in the page context
function createLovableProject(repoName) {
  // This is a placeholder - actual implementation would interact with Lovable's UI
  // In a real implementation, this would simulate clicking buttons and filling forms
  console.log('Creating Lovable project for:', repoName);
  return true;
}

function connectGitHub(repoName) {
  // Placeholder for connecting to GitHub
  console.log('Connecting project to GitHub:', repoName);
  return true;
}

function cloneRepo(repoName, token) {
  // Placeholder for cloning repository
  console.log('Cloning repository:', repoName);
  return true;
}

function replaceRepoFiles(repoName, token) {
  // Placeholder for replacing repository files
  console.log('Replacing files in repository:', repoName);
  return true;
}

function commitPush(repoName, token) {
  // Placeholder for committing and pushing
  console.log('Committing and pushing to:', repoName);
  return true;
}

function showSuccessMessage() {
  // Show success message to user
  alert('GitHub repository imported successfully! Your project will sync automatically.');
}

function updatePopupStatus(status, progress, type) {
  // This would update the popup UI
  console.log('Status update:', status, progress, type);
}
