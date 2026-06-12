import { Client } from 'appwrite';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || '';
const projectId = process.env.APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

const appwriteEnabled = !!(endpoint && projectId && apiKey);

if (!appwriteEnabled) {
  console.warn('⚠  Appwrite not configured (APPWRITE_ENDPOINT/PROJECT_ID/API_KEY missing). Password reset via Appwrite will be skipped.');
}

let adminClient: Client | null = null;

if (appwriteEnabled) {
  adminClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
}

async function adminCall(method: string, path: string, params?: Record<string, any>) {
  if (!adminClient) throw new Error('Appwrite client not initialized');
  return await adminClient.call(method, new URL(`${endpoint}${path}`), {}, params || {});
}

export async function updateUserPassword(email: string, password: string) {
  if (!appwriteEnabled) {
    console.log(`[Appwrite Skipped] Would reset password for ${email} — Appwrite not configured.`);
    return;
  }
  const users = await adminCall('get', '/users');
  const list = users as any;
  const user = list.users?.find((u: any) => u.email === email);
  if (user) {
    await adminCall('patch', `/users/${user.$id}/password`, { password });
  }
}


