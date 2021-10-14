#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();
const fs = require("fs");

program
    .requiredOption('-d, --database <db_name>', 'mysql database');

program.parse(process.argv);

const options = program.opts();
if (!options.database) return console.log("error: required option '-d, --database <db_name>' cannot be empty");

if (!fs.existsSync(`${__dirname}/config.json`)) {
    fs.appendFileSync(`${__dirname}/config.json`,
        `
{
"MYSQL_DATABASE":"${options.database}"
}
`
    )
    console.log(`success: database set to ${options.database}`)
} else {
    return console.log("error: config file already exist")
};