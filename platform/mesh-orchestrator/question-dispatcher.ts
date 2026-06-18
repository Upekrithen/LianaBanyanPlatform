import { PeerNode, NodeAnswer } from './types.js';
import { createDispatchFrame, decodeHexFrame } from './hex-encoder.js';

const RELAY_BASE = 'https://relay.lianabanyan.com/functions/v1/wan-relay-publish';

export interface DispatchOptions {
  timeoutMs?: number;
  retries?: number;
}

export async function dispatchToNode(
  node: PeerNode,
  question: { id: string; text: string; choices: string[]; correct: string },
  opts: DispatchOptions = {}
): Promise<NodeAnswer> {
  const { timeoutMs = 120000, retries = 1 } = opts;
  const startTime = Date.now();

  // Encode as LB Hexadecimal Machine Code frame
  const { hex, byteSize, encodeTimeMs } = createDispatchFrame(
    node.node_id,
    question,
    { blades: 12, ensembleMode: 'optionA' }
  );

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(RELAY_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Node-Target': node.node_id,
          'X-Hex-Frame': 'true'
        },
        body: JSON.stringify({ hex_frame: hex, target_node: node.node_id }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Relay returned ${response.status} for node ${node.node_id}`);
      }

      const data = await response.json() as { hex_frame?: string; result?: NodeAnswer };

      let answer: NodeAnswer;
      if (data.hex_frame) {
        const { payload } = decodeHexFrame(data.hex_frame);
        answer = payload as NodeAnswer;
      } else if (data.result) {
        answer = data.result;
      } else {
        throw new Error(`Unexpected response shape from node ${node.node_id}`);
      }

      answer.hex_frame_bytes = byteSize;
      answer.hex_parse_latency_ms = encodeTimeMs;
      answer.response_time_ms = Date.now() - startTime;

      return answer;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  throw lastError ?? new Error(`Dispatch to ${node.node_id} failed`);
}

export async function dispatchToAllNodes(
  nodes: PeerNode[],
  question: { id: string; text: string; choices: string[]; correct: string },
  opts: DispatchOptions = {}
): Promise<NodeAnswer[]> {
  // Option A: full-on-each-node — fan out to all nodes in parallel
  const promises = nodes.map(node => dispatchToNode(node, question, opts));
  const results = await Promise.allSettled(promises);

  const answers: NodeAnswer[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      answers.push(result.value);
    } else {
      console.error(`[DISPATCH] Node dispatch failed: ${result.reason}`);
    }
  }

  if (answers.length === 0) {
    throw new Error('All node dispatches failed — abort run (Truth-Always: no silent drops)');
  }

  return answers;
}
