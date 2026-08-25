import { db } from '../server/db.js';

async function checkConfigTable() {
  try {
    const { data: config, error } = await db.from('nexus_config').select('*').limit(1);
    if (error) {
      console.error('Error fetching config:', error.message);
      return;
    }
    console.log('Config record schema & values:', JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

checkConfigTable();
