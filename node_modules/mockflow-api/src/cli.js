#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand, startCommand, generateCommand, resetCommand } from './cli/commands.js';

const program = new Command();

program
  .name('mockflow')
  .description('Instant mock REST API generator from JSON schema')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new MockFlow configuration schema')
  .option('-c, --config <file>', 'Schema file name', 'mockflow.json')
  .option('-f, --force', 'Overwrite existing configuration file')
  .action((opts) => {
    initCommand(opts);
  });

program
  .command('start')
  .description('Start the mock REST API server')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .option('-c, --config <file>', 'Path to schema configuration', 'mockflow.json')
  .option('--prefix <prefix>', 'API route prefix', '/api')
  .option('-d, --delay <ms>', 'Simulated response delay in milliseconds', '0')
  .option('-s, --seed <number>', 'Deterministic seed for data generation')
  .action((opts) => {
    startCommand(opts);
  });

program
  .command('generate')
  .description('Generate sample data to a JSON file')
  .option('-c, --config <file>', 'Path to schema configuration', 'mockflow.json')
  .option('-o, --output <file>', 'Output JSON file name', 'mockflow-data.json')
  .option('-s, --seed <number>', 'Deterministic seed for data generation')
  .action((opts) => {
    generateCommand(opts);
  });

program
  .command('reset')
  .description('Reset generated mock data information')
  .action((opts) => {
    resetCommand(opts);
  });

program.parse(process.argv);
