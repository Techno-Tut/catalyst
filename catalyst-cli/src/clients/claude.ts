import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ClientAdapter, AgentConfig } from './types';

const execAsync = promisify(exec);

export class ClaudeCodeClient implements ClientAdapter {
  name = 'claude-code';
  private claudeDir = path.join(os.homedir(), '.claude');
  private agentsDir = path.join(this.claudeDir, 'agents');

  async isInstalled(): Promise<boolean> {
    try {
      const result = await execAsync('claude -v', { shell: '/bin/bash' });
      return true;
    } catch (error) {
      // Fallback: check if .claude directory exists (Claude Code is installed)
      return fs.pathExists(this.claudeDir);
    }
  }

  async getAgent(name: string): Promise<AgentConfig | null> {
    const agentPath = path.join(this.agentsDir, `${name}.md`);
    
    if (!await fs.pathExists(agentPath)) return null;
    
    const content = await fs.readFile(agentPath, 'utf-8');
    return this.parseMarkdownAgent(content);
  }

  private parseMarkdownAgent(content: string): AgentConfig {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error('Invalid agent format: missing frontmatter');
    }

    // Parse YAML frontmatter manually (simple key: value pairs)
    const frontmatterText = frontmatterMatch[1];
    const prompt = frontmatterMatch[2].trim();
    
    const frontmatter: any = {};
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        frontmatter[key.trim()] = value;
      }
    });

    // Convert tools string to array for compatibility
    const tools = frontmatter.tools ? frontmatter.tools.split(',').map((t: string) => t.trim()) : undefined;

    return {
      name: frontmatter.name,
      description: frontmatter.description,
      prompt: prompt || undefined,
      tools: tools,
      model: frontmatter.model
    };
  }

  async installAgent(name: string, config: AgentConfig): Promise<void> {
    await fs.ensureDir(this.agentsDir);
    const agentPath = path.join(this.agentsDir, `${name}.md`);
    
    // Convert agent config to Claude Code markdown format
    const frontmatter: Record<string, any> = {
      name: name, // Use the target name, not original config name
      description: config.description || '',
      tools: config.tools ? config.tools.join(', ') : undefined,
      model: config.model || 'sonnet'
    };

    // Remove undefined values
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined) {
        delete frontmatter[key];
      }
    });

    // Create markdown content
    const yamlContent = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const content = `---
${yamlContent}
---

${config.prompt || 'You are a helpful AI assistant.'}`;
    
    await fs.writeFile(agentPath, content);
    
    // TODO: Install MCP servers using install-mcp
    console.log('ℹ MCP server installation not implemented yet');
  }

  async listAgents(): Promise<string[]> {
    if (!await fs.pathExists(this.agentsDir)) return [];
    
    const files = await fs.readdir(this.agentsDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.basename(file, '.md'));
  }
}
