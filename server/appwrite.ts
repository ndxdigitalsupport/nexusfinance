import { Client } from 'appwrite';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || '';
const projectId = process.env.APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!endpoint || !projectId || !apiKey) {
  console.error('FATAL: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY are required.');
  process.exit(1);
}

const adminClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

async function adminCall(method: string, path: string, params?: Record<string, any>) {
  return await adminClient.call(method, new URL(`${endpoint}${path}`), {}, params || {});
}

export async function updateUserPassword(email: string, password: string) {
  const users = await adminCall('get', '/users');
  const list = users as any;
  const user = list.users?.find((u: any) => u.email === email);
  if (user) {
    await adminCall('patch', `/users/${user.$id}/password`, { password });
  }
}


