const AI_KEYWORDS = ['chatgpt', 'deepseek']; // AI-related keywords

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);

  // Check if the domain contains any AI-related keywords
  const isAIRelatedDomain = AI_KEYWORDS.some(keyword => url.origin.includes(keyword));

  if (isAIRelatedDomain) {
    // Disable the side panel on AI-related domains
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  } else {
    // Enable the side panel on non-AI domains
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'Frontend/main-screen.html',
      enabled: true
    });
  }
});
