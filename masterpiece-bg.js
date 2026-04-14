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
      .then(async blob => {
        // FileReader is not available in MV3 service workers — use arrayBuffer instead
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const base64data = `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
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
      })
      .catch(error => {
        console.error('[InstaRemix Background] Download failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});
