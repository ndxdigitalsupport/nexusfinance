import { db } from '../server/db.js';

async function clean() {
  try {
    // 1. Delete all reminder logs
    const { error: logsErr } = await db.from('nexus_reminder_logs').delete().neq('id', 0);
    if (logsErr) console.error('Error clearing reminder logs:', logsErr.message);
    else console.log('Cleared reminder logs successfully.');

    // 2. Delete Nono's loan
    const { error: nonoErr } = await db.from('nexus_loans').delete().eq('applicantName', 'Nono');
    if (nonoErr) console.error('Error clearing Nono loan:', nonoErr.message);
    else console.log('Cleared Nono loan successfully.');

    // 3. Delete Demo Customer's loans
    const { error: demoLoansErr } = await db.from('nexus_loans').delete().eq('applicantEmail', 'customer@nexus.com');
    if (demoLoansErr) console.error('Error clearing Demo Customer loans:', demoLoansErr.message);
    else console.log('Cleared Demo Customer loans successfully.');

    // 4. Delete Demo Customer from nexus_users
    const { error: demoUserErr } = await db.from('nexus_users').delete().eq('email', 'customer@nexus.com');
    if (demoUserErr) console.error('Error clearing Demo Customer user:', demoUserErr.message);
    else console.log('Cleared Demo Customer user successfully.');

  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

clean();
