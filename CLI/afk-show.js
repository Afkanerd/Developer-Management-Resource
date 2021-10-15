#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();
var mysql = require('mysql');
const fs = require("fs");

program
    .requiredOption('-u, --username <username>', 'mysql username')
    .requiredOption('-p, --password <password>', 'mysql password')
    .requiredOption('-e, --email <email>', 'admin email');

program.parse(process.argv);

const options = program.opts();
if (!options.username) return console.log("error: required option '-u, --username <username>' cannot be empty");
if (!options.email) return console.log("error: required option '-e, --email <email>' cannot be empty");
if (!options.password) return console.log("error: required option '-p, --password <password>' cannot be empty");

if (!fs.existsSync(`${__dirname}/config.json`)) {
    return console.log("error: Please configure database \ncommand: afk config -d <Database name>");
};

var connection = mysql.createConnection({
    host: 'localhost',
    user: `${options.username}`,
    password: `${options.password}`,
    database: require("./config.json").MYSQL_DATABASE
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }

    console.log('success:');

    connection.query('SELECT * FROM admins WHERE email = ?', [options.email], function (error, results, fields) {
        if (error) throw error;

        console.log(results);
        process.exit();
    });
});