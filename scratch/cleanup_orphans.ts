import { db } from '../server/db.js';

async function cleanOrphanLoans() {
  try {
    // 1. Fetch all registered user emails
    const { data: users, error: usersErr } = await db.from('nexus_users').select('email');
    if (usersErr) {
      console.error('Error fetching registered users:', usersErr.message);
      return;
    }

    const registeredEmails = new Set(users.map(u => u.email.toLowerCase()));
    console.log('Registered user emails:', Array.from(registeredEmails));

    // 2. Fetch all loans
    const { data: loans, error: loansErr } = await db.from('nexus_loans').select('id, applicantName, applicantEmail');
    if (loansErr) {
      console.error('Error fetching loans:', loansErr.message);
      return;
    }

    // 3. Find and delete loans that do not belong to registered users
    const loansToDelete = loans.filter(l => !registeredEmails.has(l.applicantEmail.toLowerCase()));
    console.log('Loans to delete (no matching registered user account):', loansToDelete);

    if (loansToDelete.length === 0) {
      console.log('No orphan demo loans found.');
      return;
    }

    for (const loan of loansToDelete) {
      const { error: delErr } = await db.from('nexus_loans').delete().eq('id', loan.id);
      if (delErr) {
        console.error(`Failed to delete loan ${loan.id} (${loan.applicantName}):`, delErr.message);
      } else {
        console.log(`Successfully deleted demo loan ${loan.id} for "${loan.applicantName}"`);
      }
    }

    console.log('Orphan loans cleanup completed successfully.');
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

cleanOrphanLoans();
