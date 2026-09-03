import { db } from '../server/db.js';

async function checkSchema() {
  const { data, error } = await db.from('nexus_loans').select('*').limit(1);
  if (error) {
    console.error('Error fetching loan:', error);
  } else {
    console.log('Sample loan record:', data[0]);
    console.log('Type of id:', typeof data[0]?.id);
  }
}

checkSchema();
