#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();
var mysql = require('mysql');
const fs = require("fs");
const Security = require("../models/security.model.js");
const security = new Security();
const {
    v4: uuidv4,
    v1: uuidv1
} = require('uuid');
var generator = require('generate-password');
const MOMENT = require('moment');

program
    .requiredOption('-u, --username <username>', 'mysql username')
    .requiredOption('-p, --password <password>', 'mysql password')
    .requiredOption('-e, --email <email>', 'admin email')
    .requiredOption('-t, --task <project_name>', 'admin email')
    .requiredOption('-s, --scope <project_scope>', 'admin email');

program.parse(process.argv);

const options = program.opts();
if (!options.username) return console.log("error: required option '-u, --username <username>' cannot be empty");
if (!options.email) return console.log("error: required option '-e, --email <email>' cannot be empty");
if (!options.password) return console.log("error: required option '-p, --password <password>' cannot be empty");
if (!options.password) return console.log("error: required option '-t, --task <project_name>' cannot be empty");
if (!options.password) return console.log("error: required option '-s, --scope <project_scope>' cannot be empty");

if (!fs.existsSync(`${__dirname}/config.json`)) {
    return console.log("error: Please configure database \ncommand: afk config -d <Database name>");
};

var connection = mysql.createConnection({
    host: 'localhost',
    user: `${options.username}`,
    password: `${options.password}`,
    database: require("./config.json").MYSQL_DATABASE
});

connection.connect(async function (err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }

    console.log('success:');

    connection.query('SELECT * FROM users WHERE email = ?', [options.email], async function (error, results, fields) {
        let user_id = "";
        let project_id = "";

        if (error) throw error.message;

        if (results.length < 1) {
            console.log("USER DOESN'T EXIST")
            process.exit();
        } else if (results.length > 1) {
            console.log("DUPLICATE USERS")
            process.exit();
        } else {
            user_id = results[0].id

            connection.query('SELECT * FROM projects WHERE name = ?', [options.task], async function (error, results, fields) {
                if (error) throw error.message;

                if (results.length < 1) {
                    console.log("PROJECT DOESN'T EXIST")
                    process.exit();
                } else if (results.length > 1) {
                    console.log("DUPLICATE PROJECTS")
                    process.exit();
                } else {
                    project_id = results[0].id

                    connection.query('SELECT * FROM users_projects WHERE userId = ? AND projectId = ?', [user_id, project_id], async function (error, results, fields) {
                        if (error) throw error.message;

                        if (results.length < 1) {
                            console.log("USER DOESN'T HAVE THIS PROJECT")
                            process.exit();
                        } else if (results.length > 1) {
                            console.log("DUPLICATE USER/PROJECT RECORDS")
                            process.exit();
                        } else {
                            var data = {
                                scope: options.scope,
                                updatedAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000')
                            };

                            connection.query('UPDATE users_projects SET ? WHERE userId = ? AND projectId = ?', [data, user_id, project_id], function (error, results, fields) {
                                if (error) throw error.message;

                                connection.query('SELECT * FROM users_projects WHERE userId = ? AND projectId = ?', [user_id, project_id], async function (error, results, fields) {
                                    if (error) throw error.message;

                                    console.log(results);
                                    process.exit();
                                });
                            });
                        };
                    });
                };
            });
        };
    });
});