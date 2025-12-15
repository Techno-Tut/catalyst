import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentConfig } from '../clients/types';

export interface PackageManifest {
  name: string;
  version: string;
  description?: string;
  agent: AgentConfig;
  createdAt: string;
}

export class AgentPackager {
  private outputDir = './tmp';

  async createPackage(agent: AgentConfig): Promise<string> {
    // Ensure output directory exists
    await fs.ensureDir(this.outputDir);

    // Create package manifest
    const manifest: PackageManifest = {
      name: agent.name,
      version: '1.0.0', // TODO: Make configurable
      description: agent.description,
      agent: agent,
      createdAt: new Date().toISOString()
    };

    // Create package filename
    const packageName = `${agent.name}-v${manifest.version}.json`;
    const packagePath = path.join(this.outputDir, packageName);

    // Write package file
    await fs.writeJson(packagePath, manifest, { spaces: 2 });

    return packagePath;
  }
}
