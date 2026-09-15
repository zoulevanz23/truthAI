import { chrome } from 'webextension-types';

// Initialize state
let analysisInProgress = false;

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'verify-link') {
    const url = info.linkUrl || info.pageUrl;
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'verify-link', url });
    }
  }
});

// Message listener from content script
chrome.runtime.onMessage.addListener(
  async (message: any, sender, sendResponse) => {
    if (message.type === 'analyze-selection') {
      const { text, pageUrl } = message;
      try {
        // Show loading state
        chrome.action.setBadgeText({ tabId: sender.tab?.id, text: 'Anal' });
        chrome.action.setBadgeBackgroundColor({ tabId: sender.tab?.id, color: '#1D4ED8' });

        // Call the backend API
        const response = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: text, type: 'message' }),
        });

        const data = await response.json();

        if (response.ok) {
          // Display result in popup or notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon16.png',
            title: 'TruthCheck AI',
            message: `${data.result.verdict}: ${data.result.explanation?.slice(0, 200)}`,
          });
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon16.png',
            title: 'TruthCheck AI',
            message: 'Analysis failed: ' + (data.error || 'Unknown error'),
          });
        }
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        chrome.action.setBadgeText({ tabId: sender.tab?.id, text: '' });
      }
      return true; // Keep the message channel open
    }
  }
);

// Initialize context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'verify-link',
    title: 'Verify this link',
    contexts: ['link', 'selection'],
  });
});