import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ClientAdapter, AgentConfig } from './types';

const execAsync = promisify(exec);

export class KiroClient implements ClientAdapter {
  name = 'kiro';
  private agentsDir = path.join(os.homedir(), '.kiro', 'agents');

  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('kiro-cli --version');
      return true;
    } catch {
      return false;
    }
  }

  async getAgent(name: string): Promise<AgentConfig | null> {
    const agentPath = path.join(this.agentsDir, `${name}.json`);
    
    if (!await fs.pathExists(agentPath)) return null;
    
    return fs.readJson(agentPath);
  }

  async installAgent(name: string, config: AgentConfig): Promise<void> {
    await fs.ensureDir(this.agentsDir);
    
    // Update the agent name to match the target name
    const updatedConfig = {
      ...config,
      name: name
    };
    
    const agentPath = path.join(this.agentsDir, `${name}.json`);
    await fs.writeJson(agentPath, updatedConfig, { spaces: 2 });
  }

  async listAgents(): Promise<string[]> {
    if (!await fs.pathExists(this.agentsDir)) return [];
    
    const files = await fs.readdir(this.agentsDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  }
}
