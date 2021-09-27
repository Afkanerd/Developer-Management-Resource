const mysql = require('mysql');
const assert = require('chai').assert;
const database = require("../config.json").database;
const db = require("../models");
const server = require("../index.js");

describe('Starting tests ...', function () {
    describe('Database', function () {
        let connection = mysql.createConnection({
            host: database.MYSQL_HOST,
            user: database.MYSQL_USER,
            password: database.MYSQL_PASSWORD
        });

        it('Connection', function (done) {
            connection.connect(function (err) {
                if (err) done(err);

                assert.equal(connection.state, "connected");
                done()
            });
        });

        it(`Creating database "${database.MYSQL_DATABASE}"`, function (done) {
            connection.query(`CREATE DATABASE IF NOT EXISTS ${database.MYSQL_DATABASE};`, function (error, result) {
                if (error) done(error);
                assert.isObject(result);
                done();
            });
        });

        it(`Creating database tables`, async function () {
            try {
                await db.sequelize.sync({
                    alter: true,
                    alter: {
                        drop: false
                    }
                })
                assert.ok(true);
            } catch (err) {
                assert.fail(err)
            }
        });
    });
});

describe('Starting Server ...', function () {
    it('Running', function (done) {
        try {
            server();
            done();
        } catch (err) {
            done(err);
        }
    });
});