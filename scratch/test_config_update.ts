import { db } from '../server/db.js';

async function testUpdate() {
  try {
    const updateBody = {
      kycRequired: false,
      telegram_admin_id: '123456789',
      enable_admin_reports: true
    };
    
    console.log('Sending update to Supabase:', updateBody);
    const { data, error } = await db.from('nexus_config').update(updateBody).eq('id', 1).select();
    
    if (error) {
      console.error('Database Update failed with error:', error);
    } else {
      console.log('Database Update succeeded. Result:', data);
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

testUpdate();
