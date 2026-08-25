import { db } from '../server/db.js';

async function checkAuditSchema() {
  try {
    // 1. Try to fetch 1 row
    const { data: logs, error } = await db.from('nexus_audit_logs').select('*').limit(1);
    if (error) {
      console.error('Error fetching audit logs:', error);
      return;
    }
    console.log('Audit logs sample record:', logs);
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

checkAuditSchema();
