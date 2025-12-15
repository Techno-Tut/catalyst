#!/usr/bin/env node

import { Command } from 'commander';
import { PublishCommand } from './commands/publish';
import { InstallCommand } from './commands/install';
import { ClientDetector } from './clients/detector';
import { AgentPackager } from './packaging/packager';

const program = new Command();

program
  .name('catalyst')
  .description('AI agent distribution platform')
  .version('0.1.0');

program
  .command('publish [agent-name]')
  .description('Publish an agent package')
  .option('-c, --client <client>', 'Specify client (kiro, claude-code)')
  .action(async (agentName, options) => {
    try {
      const detector = new ClientDetector();
      const packager = new AgentPackager();
      const publishCommand = new PublishCommand(detector, packager);
      await publishCommand.execute(agentName, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('install <package>')
  .description('Install an agent package')
  .option('--name <name>', 'Agent name to install as')
  .option('-c, --client <client>', 'Specify client (kiro, claude-code)')
  .action(async (packagePath, options) => {
    try {
      const detector = new ClientDetector();
      const installCommand = new InstallCommand(detector);
      await installCommand.execute(packagePath, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
