import { KiroClient } from './kiro';
import { ClaudeCodeClient } from './claude';
import { ClientAdapter } from './types';

export class ClientDetector {
  private clients: ClientAdapter[] = [
    new KiroClient(),
    new ClaudeCodeClient()
  ];

  async getAvailableClients(): Promise<ClientAdapter[]> {
    const available: ClientAdapter[] = [];
    
    for (const client of this.clients) {
      if (await client.isInstalled()) {
        available.push(client);
      }
    }
    
    return available;
  }

  async getClientByName(name: string): Promise<ClientAdapter | null> {
    const client = this.clients.find(c => c.name === name);
    if (!client) return null;
    
    return (await client.isInstalled()) ? client : null;
  }
}
