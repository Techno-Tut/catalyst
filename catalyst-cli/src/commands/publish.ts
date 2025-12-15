import { ClientDetector } from '../clients/detector';
import { ClientAdapter } from '../clients/types';
import { AgentPackager } from '../packaging/packager';
import inquirer from 'inquirer';

export interface PublishOptions {
  client?: string;
}

export class PublishCommand {
  constructor(
    private detector: ClientDetector,
    private packager: AgentPackager
  ) {}

  async execute(agentName?: string, options: PublishOptions = {}): Promise<void> {
    console.log(`Publishing agent: ${agentName || 'auto-detect'}`);
    
    // Step 1: Get client (with interactive selection if needed)
    const client = await this.getClient(options.client);
    if (!client) {
      throw new Error('No compatible AI CLI found');
    }
    
    console.log(`Using client: ${client.name}`);
    
    // Step 2: Get agent (with interactive selection if needed)
    const agent = await this.getAgent(client, agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }
    
    console.log(`Found agent: ${agent.name}`);
    
    // Step 3: Package and save
    const packagePath = await this.packager.createPackage(agent);
    console.log(`✓ Package created: ${packagePath}`);
  }

  private async getClient(clientName?: string): Promise<ClientAdapter | null> {
    if (clientName) {
      return this.detector.getClientByName(clientName);
    }
    
    const available = await this.detector.getAvailableClients();
    if (available.length === 0) return null;
    if (available.length === 1) return available[0];
    
    // Show available clients in a nice format
    console.log('\nAvailable AI CLI clients:');
    
    // Interactive selection for multiple clients
    const { selectedClient } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedClient',
      message: 'Select AI CLI client to publish from:',
      choices: available.map(client => {
        const displayName = client.name === 'kiro' ? 'Kiro CLI' : 
                           client.name === 'claude-code' ? 'Claude Code' : client.name;
        return {
          name: `  ${displayName.padEnd(20)} (${client.name})`,
          value: client.name
        };
      })
    }]);
    
    return this.detector.getClientByName(selectedClient);
  }

  private async getAgent(client: ClientAdapter, agentName?: string) {
    if (agentName) {
      return client.getAgent(agentName);
    }
    
    // Interactive agent selection
    const agents = await client.listAgents();
    if (agents.length === 0) return null;
    if (agents.length === 1) return client.getAgent(agents[0]);
    
    console.log(`\nAvailable agents in ${client.name}:`);
    
    const { selectedAgent } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedAgent',
      message: 'Select agent to publish:',
      choices: agents.map(agent => `  ${agent}`)
    }]);
    
    return client.getAgent(selectedAgent.trim());
  }
}
