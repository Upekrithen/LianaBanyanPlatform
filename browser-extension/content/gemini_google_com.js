/**
 * MnemosyneC content script — Gemini (gemini.google.com)
 * Observes chat turns, extracts Q+A pairs, logs structured objects.
 * v0.2.0 SEG-1: route captured pairs to background → MCP server.
 * Today: DOM observation + logging stub only.
 */

console.log('[MnemosyneC] Content script loaded on gemini.google.com');

// Turn boundary detection for Gemini
// Gemini uses message-content elements within conversation turns
// Query/response pairs live under .conversation-container > .exchange or similar
function observeChatTurns() {
  const seen = new WeakSet();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        // Gemini model-response elements carry [data-response-index] or .model-response-text
        const modelResponse =
          node.matches?.('.model-response-text')
            ? node
            : node.querySelector?.('.model-response-text');

        if (!modelResponse || seen.has(modelResponse)) continue;
        seen.add(modelResponse);

        // Closest exchange container holds both the user prompt and model response
        const exchange = modelResponse.closest('.conversation-turn, .exchange, [data-turn]');
        const userQuery = exchange
          ? exchange.querySelector('.query-text, .user-query, [data-query]')
          : null;

        const qa = {
          question: userQuery?.textContent?.trim() || '',
          answer: modelResponse.textContent?.trim() || '',
          source: 'gemini.google.com',
          capturedAt: new Date().toISOString(),
        };

        console.log('[MnemosyneC] Turn detected:', {
          q: qa.question.substring(0, 80),
          a: qa.answer.substring(0, 80),
        });
        // v0.2.0: chrome.runtime.sendMessage({ type: 'QA_CAPTURED', data: qa })
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[MnemosyneC] Observing Gemini turns...');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatTurns);
} else {
  observeChatTurns();
}
