const ws = require('ws');
const client = new ws('ws://127.0.0.1:9229/devtools/page/CAAB4371EDC7558BC786B3DEEBD6E387');
let id = 1;
const contexts = [];
const consoleMessages = [];

function send(method, params) {
  return new Promise(res => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) { client.off('message', handler); res(msg); }
    };
    client.on('message', handler);
    client.send(JSON.stringify({ id: msgId, method, params: params || {} }));
  });
}

client.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.method === 'Runtime.executionContextCreated') {
    contexts.push(msg.params.context);
    console.log('Context created:', JSON.stringify(msg.params.context));
  }
  if (msg.method === 'Runtime.consoleAPICalled') {
    consoleMessages.push(msg.params);
    const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
    console.log('[console.' + msg.params.type + ']', text);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    console.log('[EXCEPTION]', JSON.stringify(msg.params.exceptionDetails));
  }
});

client.on('open', async () => {
  try {
    await send('Runtime.enable');
    await send('Console.enable');

    // Get all execution contexts
    const ctxResult = await send('Runtime.getIsolateId');
    console.log('IsolateId:', JSON.stringify(ctxResult));

    // Wait a moment to collect context events
    await new Promise(r => setTimeout(r, 2000));

    // List contexts found
    console.log('Total contexts seen:', contexts.length);

    // Try evaluating in each context
    for (const ctx of contexts) {
      console.log('--- Context', ctx.id, ':', ctx.name, '---');
      try {
        const r = await send('Runtime.evaluate', {
          expression: 'typeof exports + "|" + typeof contextBridge + "|" + typeof ipcRenderer + "|" + typeof window',
          contextId: ctx.id,
          returnByValue: true,
          throwOnSideEffects: false
        });
        console.log('  exports|contextBridge|ipcRenderer|window:', JSON.stringify(r.result?.value));
        if (r.exceptionDetails) {
          console.log('  exception:', JSON.stringify(r.exceptionDetails));
        }
      } catch (e) {
        console.log('  eval error:', e.message);
      }
    }

  } catch(e) { console.error('CDP error:', e.message, e.stack); }
  client.close();
});
client.on('error', e => { console.error('WS error:', e.message); process.exit(1); });
