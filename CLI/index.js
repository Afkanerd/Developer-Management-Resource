#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();

program.version('0.0.1', '-v, --vers', 'output the current version');

program
    .command('show', "Show admin creds")
    .command('config', "Configurations")
    .command('add', "Add and Admin")
    .command('assign', "Assign user to project")

program.showHelpAfterError();
program.parse();