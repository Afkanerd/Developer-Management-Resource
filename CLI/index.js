#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();

program.version('0.0.1', '-v, --vers', 'output the current version');

program
    .command('show', "Show admin creds")
    .command('config', "Configurations")

program.showHelpAfterError();
program.parse();