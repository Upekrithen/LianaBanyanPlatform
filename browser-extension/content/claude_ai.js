/**
 * MnemosyneC content script — Claude (claude.ai)
 * Observes chat turns, extracts Q+A pairs, logs structured objects.
 * v0.2.0 SEG-1: route captured pairs to background → MCP server.
 * Today: DOM observation + logging stub only.
 */

console.log('[MnemosyneC] Content script loaded on claude.ai');

// Turn boundary detection for Claude
// claude.ai uses [data-testid="human-turn"] and [data-testid="ai-turn"]
function observeChatTurns() {
  const seen = new WeakSet();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        // Detect completed AI turn (signals end of a full exchange)
        const aiTurn = node.matches?.('[data-testid="ai-turn"]')
          ? node
          : node.querySelector?.('[data-testid="ai-turn"]');

        if (!aiTurn || seen.has(aiTurn)) continue;
        seen.add(aiTurn);

        // Walk back to find the preceding human turn
        const humanTurn =
          aiTurn.previousElementSibling?.matches?.('[data-testid="human-turn"]')
            ? aiTurn.previousElementSibling
            : document.querySelector('[data-testid="human-turn"]:last-of-type');

        const qa = {
          question: humanTurn?.textContent?.trim() || '',
          answer: aiTurn.textContent?.trim() || '',
          source: 'claude.ai',
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
  console.log('[MnemosyneC] Observing Claude turns...');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatTurns);
} else {
  observeChatTurns();
}
