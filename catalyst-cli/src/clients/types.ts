export interface AgentConfig {
  name: string;
  description?: string;
  prompt?: string;
  tools?: string[];
  [key: string]: any; // Allow client-specific fields
}

export interface ClientAdapter {
  name: string;
  isInstalled(): Promise<boolean>;
  getAgent(name: string): Promise<AgentConfig | null>;
  installAgent(name: string, config: AgentConfig): Promise<void>;
  listAgents(): Promise<string[]>;
}
