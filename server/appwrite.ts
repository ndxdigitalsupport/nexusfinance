import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || '';
const projectId = process.env.APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

const appwriteEnabled = !!(endpoint && projectId && apiKey);

if (!appwriteEnabled) {
  console.warn('⚠  Appwrite not configured (APPWRITE_ENDPOINT/PROJECT_ID/API_KEY missing). Verification and password reset via Appwrite will be skipped.');
}

export async function adminCall(method: string, path: string, params?: Record<string, any>) {
  if (!appwriteEnabled) throw new Error('Appwrite not configured');
  const url = `${endpoint}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    },
    body: params ? JSON.stringify(params) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Appwrite API ${method} ${path}: ${response.status} — ${text}`);
  }
  return response.json();
}

export async function updateUserPassword(email: string, password: string) {
  if (!appwriteEnabled) {
    console.log(`[Appwrite Skipped] Would reset password for ${email} — Appwrite not configured.`);
    return;
  }
  const list = await adminCall('get', '/users') as any;
  const user = list.users?.find((u: any) => u.email === email);
  if (user) {
    await adminCall('patch', `/users/${user.$id}/password`, { password });
  }
}

export async function createAppwriteUser(email: string, password: string, name: string) {
  if (!appwriteEnabled) {
    console.log(`[Appwrite Skipped] Would create user ${email} — Appwrite not configured.`);
    return null;
  }
  const result = await adminCall('post', '/users', { email, password, name }) as any;
  return result.$id as string;
}

export async function getAppwriteUserVerificationStatus(email: string): Promise<boolean> {
  if (!appwriteEnabled) {
    console.log(`[Appwrite Skipped] Would check verification for ${email} — returning true (skip check).`);
    return true;
  }
  const list = await adminCall('get', '/users') as any;
  const user = list.users?.find((u: any) => u.email === email);
  if (!user) return true;
  return !!user.emailVerification;
}
