import { KiroClient } from '../src/clients/kiro';
import { ClaudeCodeClient } from '../src/clients/claude';

async function testKiroClient() {
  console.log('=== Testing Kiro Client ===');
  
  const kiro = new KiroClient();
  
  try {
    // Test if Kiro is installed
    const isInstalled = await kiro.isInstalled();
    console.log(`✓ Kiro installed: ${isInstalled}`);
    
    if (isInstalled) {
      // Test listing agents
      const agents = await kiro.listAgents();
      console.log(`✓ Found ${agents.length} agents: [${agents.join(', ')}]`);
      
      // Test reading an agent (if any exist)
      if (agents.length > 0) {
        const firstAgent = agents[0];
        const agent = await kiro.getAgent(firstAgent);
        console.log(`✓ Read agent '${firstAgent}':`, JSON.stringify(agent, null, 2));
      } else {
        console.log('ℹ No agents found to test reading');
      }
    } else {
      console.log('ℹ Kiro not installed, skipping agent tests');
    }
    
  } catch (error) {
    console.error('✗ Error testing Kiro client:', error);
  }
}

async function testClaudeCodeClient() {
  console.log('\n=== Testing Claude Code Client ===');
  
  const claude = new ClaudeCodeClient();
  
  try {
    // Test if Claude Code is installed
    const isInstalled = await claude.isInstalled();
    console.log(`✓ Claude Code installed: ${isInstalled}`);
    
    if (isInstalled) {
      // Test listing agents
      const agents = await claude.listAgents();
      console.log(`✓ Found ${agents.length} agents: [${agents.join(', ')}]`);
      
      // Test reading an agent (if any exist)
      if (agents.length > 0) {
        const firstAgent = agents[0];
        const agent = await claude.getAgent(firstAgent);
        console.log(`✓ Read agent '${firstAgent}':`, JSON.stringify(agent, null, 2));
      } else {
        console.log('ℹ No agents found to test reading');
      }
    } else {
      console.log('ℹ Claude Code not installed, skipping agent tests');
    }
    
  } catch (error) {
    console.error('✗ Error testing Claude Code client:', error);
  }
}

// Run tests
async function runTests() {
  await testKiroClient();
  await testClaudeCodeClient();
}

runTests();
