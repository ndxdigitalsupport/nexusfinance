import { Client, Account, ID } from 'appwrite';

const cfg = (window as any).__APPWRITE__ || {};
const client = new Client()
  .setEndpoint(cfg.endpoint || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(cfg.projectId || '6a2a5cce00273365afb7');

export const account = new Account(client);
export { ID };
