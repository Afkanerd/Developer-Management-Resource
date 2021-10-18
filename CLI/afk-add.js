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
    .option('-e, --email <email>', 'admin email')
    .option('-a, --admin', 'Switch to admins database')
    .option('-t, --task <project_name>', 'Project name')
    .option('-g, --generate <generate>', 'generate a user password');

program.parse(process.argv);

const options = program.opts();

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

    let auth_id = security.hash(uuidv4())
    let auth_key = security.hash(uuidv1())

    if (options.admin) {
        if (!options.email) return console.log("error: required option '-e, --email <email>' cannot be empty");

        var data = {
            id: uuidv1(),
            auth_id: auth_id,
            auth_key: auth_key,
            email: options.email,
            createdAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000'),
            updatedAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000')
        };

        connection.query('CREATE TABLE IF NOT EXISTS admins(id VARCHAR(64), auth_id VARCHAR(255) UNIQUE, auth_key VARCHAR(255) UNIQUE, email VARCHAR(255) UNIQUE, createdAt DATETIME, updatedAt DATETIME, PRIMARY KEY(id));', function (error, results, fields) {
            if (error) throw error.message;

            connection.query('INSERT INTO admins SET ?', data, function (error, results, fields) {
                if (error) throw error.message;

                connection.query('SELECT * FROM admins WHERE email = ?', [options.email], async function (error, results, fields) {
                    if (error) throw error.message;

                    console.log(results);
                    process.exit();
                });
            });
        });
    } else if (options.task) {
        if (!options.task) return console.log("error: required option '-t, --task <project name>' cannot be empty");

        var data = {
            id: uuidv1(),
            name: options.task,
            createdAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000'),
            updatedAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000')
        };

        connection.query('CREATE TABLE IF NOT EXISTS projects(id VARCHAR(64), name VARCHAR(255) UNIQUE, createdAt DATETIME, updatedAt DATETIME, PRIMARY KEY(id));', function (error, results, fields) {
            if (error) throw error.message;

            connection.query('INSERT INTO projects SET ?', data, function (error, results, fields) {
                if (error) throw error.message;

                connection.query('SELECT * FROM projects WHERE name = ?', [options.task], async function (error, results, fields) {
                    if (error) throw error.message;

                    console.log(results);
                    process.exit();
                });
            });
        });
    } else {
        if (!options.email) return console.log("error: required option '-e, --email <email>' cannot be empty");

        let password = "";

        if (options.generate) {
            password = options.generate
        } else {
            password = generator.generate({
                length: 10,
                numbers: true,
                symbols: true,
                lowercase: true,
                uppercase: true
            });
        }

        var data = {
            id: uuidv1(),
            auth_id: auth_id,
            auth_key: auth_key,
            email: options.email,
            password: security.hash(password),
            createdAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000'),
            updatedAt: MOMENT().format('YYYY-MM-DD  HH:mm:ss.000')
        };

        connection.query('CREATE TABLE IF NOT EXISTS users(id VARCHAR(64), auth_id VARCHAR(255) UNIQUE, auth_key VARCHAR(255) UNIQUE, email VARCHAR(255) UNIQUE, password VARCHAR(255), createdAt DATETIME, updatedAt DATETIME, PRIMARY KEY(id));', function (error, results, fields) {
            if (error) throw error.message;

            connection.query('INSERT INTO users SET ?', data, function (error, results, fields) {
                if (error) throw error.message;

                connection.query('SELECT * FROM users WHERE email = ?', [options.email], async function (error, results, fields) {
                    if (error) throw error.message;

                    let result = {
                        id: results[0].id,
                        auth_id: results[0].auth_id,
                        auth_key: results[0].auth_key,
                        email: results[0].email,
                        password: password,
                        createdAt: results[0].createdAt,
                        updatedAt: results[0].updatedAt
                    };

                    console.log(result);
                    process.exit();
                });
            });
        });
    }
});