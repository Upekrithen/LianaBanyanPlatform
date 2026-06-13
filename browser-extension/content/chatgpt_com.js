/**
 * MnemosyneC content script — ChatGPT (chatgpt.com)
 * Observes chat turns, extracts Q+A pairs, logs structured objects.
 * v0.2.0 SEG-1: route captured pairs to background → MCP server.
 * Today: DOM observation + logging stub only.
 */

console.log('[MnemosyneC] Content script loaded on chatgpt.com');

// Turn boundary detection for ChatGPT
// ChatGPT uses article[data-testid="conversation-turn-*"] elements
function observeChatTurns() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        // Detect user turn (question)
        const userTurn = node.querySelector?.('[data-message-author-role="user"]');
        // Detect assistant turn (answer)
        const assistantTurn = node.querySelector?.('[data-message-author-role="assistant"]');

        if (assistantTurn && userTurn) {
          const qa = {
            question: userTurn.textContent?.trim() || '',
            answer: assistantTurn.textContent?.trim() || '',
            source: 'chatgpt.com',
            capturedAt: new Date().toISOString(),
          };
          console.log('[MnemosyneC] Turn detected:', {
            q: qa.question.substring(0, 80),
            a: qa.answer.substring(0, 80),
          });
          // v0.2.0: chrome.runtime.sendMessage({ type: 'QA_CAPTURED', data: qa })
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[MnemosyneC] Observing ChatGPT turns...');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatTurns);
} else {
  observeChatTurns();
}
