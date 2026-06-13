/**
 * MnemosyneC local MCP client stub — BP081 K-3
 * v0.2.0 SEG-1: real POST to localhost:11456 (MnemosyneC MCP server from K-2)
 * Today: stub-only, logs intent, no real POST.
 */

const MNEM_MCP_BASE = 'http://localhost:11456';

async function postQA(qa) {
  // v0.2.0: real implementation
  // const response = await fetch(`${MNEM_MCP_BASE}/mcp/record`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${await getAuthToken()}`,
  //   },
  //   body: JSON.stringify({
  //     question: qa.question,
  //     answer: qa.answer,
  //     provenance: qa.source,
  //   }),
  // });
  console.log('[MnemosyneC MCP Bridge] postQA stub —', {
    q: qa.question?.substring(0, 60),
    source: qa.source,
    note: 'Real POST to localhost:11456 in v0.2.0',
  });
  return {
    success: false,
    reason: 'stub_not_implemented',
    targetUrl: `${MNEM_MCP_BASE}/mcp/record`,
  };
}

async function querySubstrate(question) {
  console.log('[MnemosyneC MCP Bridge] querySubstrate stub —', question?.substring(0, 60));
  // v0.2.0: real implementation
  // const response = await fetch(`${MNEM_MCP_BASE}/mcp/query`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ question }),
  // });
  // return response.json();
  return { eblets: [], note: 'stub' };
}

// Export for use in service_worker.js (MV3 module pattern)
if (typeof module !== 'undefined') {
  module.exports = { postQA, querySubstrate };
}
