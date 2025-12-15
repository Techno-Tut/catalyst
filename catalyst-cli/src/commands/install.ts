import * as fs from 'fs-extra';
import { ClientDetector } from '../clients/detector';
import { ClientAdapter } from '../clients/types';
import { PackageManifest } from '../packaging/packager';
import inquirer from 'inquirer';

export interface InstallOptions {
  name?: string;
  client?: string;
}

export class InstallCommand {
  constructor(private detector: ClientDetector) {}

  async execute(packagePath: string, options: InstallOptions = {}): Promise<void> {
    console.log(`Installing package: ${packagePath}`);
    
    // Step 1: Read package file
    const manifest = await this.readPackage(packagePath);
    const agentName = options.name || manifest.agent.name;
    
    console.log(`Package: ${manifest.name} v${manifest.version}`);
    console.log(`Installing as: ${agentName}`);
    
    // Step 2: Get target client (with interactive selection if needed)
    const client = await this.getClient(options.client);
    if (!client) {
      throw new Error('No compatible AI CLI found');
    }
    
    console.log(`Installing to: ${client.name}`);
    
    // Step 3: Install agent (client handles everything)
    await client.installAgent(agentName, manifest.agent);
    console.log(`✓ Agent '${agentName}' installed successfully`);
  }

  private async readPackage(packagePath: string): Promise<PackageManifest> {
    if (!await fs.pathExists(packagePath)) {
      throw new Error(`Package file not found: ${packagePath}`);
    }
    
    return fs.readJson(packagePath);
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
      message: 'Select target AI CLI client to install to:',
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
}
