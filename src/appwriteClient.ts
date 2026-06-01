import { Client, Account, ID } from 'appwrite';

const cfg = (window as any).__APPWRITE__ || {};
const client = new Client()
  .setEndpoint(cfg.endpoint || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(cfg.projectId || '6a1d2f3b002adfa34f7a');

export const account = new Account(client);
export { ID };
