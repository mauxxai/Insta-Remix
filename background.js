/**
 * InstaRemix Background Service Worker
 * Handles cross-origin downloads to bypass CORS restrictions
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadFile') {
    const { url, filename } = message;

    // Use chrome.downloads API if we have permission, 
    // or fetch in background then download.
    // For MV3, fetching in the background service worker 
    // bypasses the site's CORS restrictions.

    fetch(url, { mode: 'cors', credentials: 'omit' })
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          chrome.downloads.download({
            url: base64data,
            filename: filename,
            saveAs: false
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true, id: downloadId });
            }
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('[InstaRemix Background] Download failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});
