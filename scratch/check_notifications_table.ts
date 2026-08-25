import { db } from '../server/db.js';

async function checkNotificationsTable() {
  try {
    const { data, error } = await db.from('nexus_notifications').select('*').limit(1);
    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      console.log('Notifications table exists. Sample data:', data);
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

checkNotificationsTable();
