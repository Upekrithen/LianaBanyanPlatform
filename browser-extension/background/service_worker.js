/**
 * MnemosyneC background service worker — MV3
 * Message bus between content scripts and local MnemosyneC MCP server (localhost:11456)
 * v0.2.0 SEG-1 wires real MCP calls. Today: routing stubs + logging.
 */

const MNEM_MCP_PORT = 11456;
const MNEM_VERSION = '0.1.0';

console.log(`[MnemosyneC] Background service worker started · v${MNEM_VERSION}`);

// Message routing from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[MnemosyneC] Received message:', message.type, 'from tab:', sender.tab?.id);

  switch (message.type) {
    case 'QA_CAPTURED':
      // v0.2.0: route to local_mcp_client.postQA(message.data)
      console.log('[MnemosyneC] QA captured (stub):', {
        q: message.data?.question?.substring(0, 50),
        a: message.data?.answer?.substring(0, 50),
      });
      sendResponse({ success: true, routed: 'stub', note: 'Real MCP routing in v0.2.0' });
      break;

    case 'GET_STATUS':
      sendResponse({
        connected: false, // v0.2.0: check actual MCP connection
        ebletCount: 0,    // v0.2.0: query mnem_get_substrate_stats
        version: MNEM_VERSION,
        note: 'stub',
      });
      break;

    default:
      console.warn('[MnemosyneC] Unknown message type:', message.type);
      sendResponse({ success: false, error: 'unknown_message_type' });
  }

  return true; // Keep message channel open for async
});

// Extension install / update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[MnemosyneC] Extension installed/updated:', details.reason);
});
