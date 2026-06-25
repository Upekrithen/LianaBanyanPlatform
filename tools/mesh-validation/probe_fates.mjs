import { pathToFileURL } from 'url';
try {
  const mod = await import(pathToFileURL('C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/dist/scribes/fates.js').href);
  console.log('fates.js exports:', Object.keys(mod));
} catch(e) {
  console.error('fates.js import FAIL:', e.message);
}
try {
  const mod = await import(pathToFileURL('C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/dist/cathedral_supabase/member_fates.js').href);
  console.log('member_fates.js exports:', Object.keys(mod));
} catch(e) {
  console.error('member_fates.js import FAIL:', e.message);
}
