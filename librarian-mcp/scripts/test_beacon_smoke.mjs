import { runDaySeed, BEACONS_DB_PATH } from '../dist/beacon_scribe/beacon_db.js';
import {
  handleBeaconDrop,
  handleBeaconList,
  handleBeaconQuery,
  handleBeaconExpire,
  handleBeaconCompose,
  handleBeaconIntersectChronos,
} from '../dist/beacon_scribe/beacon_tools.js';

console.log('DB path:', BEACONS_DB_PATH);
const seed = runDaySeed();
console.log('Seed result:', JSON.stringify(seed));

const drop = handleBeaconDrop({
  marker_type: 'strain-canon',
  applied_to: [{ entity_class: 'eblet', entity_id: '/test/example.md' }],
  applied_by: 'knight',
  description: 'Smoke test beacon',
});
console.log('Drop result:', JSON.stringify(drop));

const list = handleBeaconList({ marker_type: 'strain-canon' });
console.log('List count:', list.total_count, 'total beacons');

const query = handleBeaconQuery({ marker_type: 'strain-canon' });
console.log('Query entities:', query.entities.length);

const expired = handleBeaconExpire({ beacon_id: drop.beacon_id, reason: 'smoke test cleanup' });
console.log('Expire result:', JSON.stringify(expired));

console.log('ALL SMOKE TESTS PASSED');
