const mysql = require('mysql');
const assert = require('chai').assert;
const database = require("../config.json").database;

describe('Starting tests ...', function () {
    describe('Database', function () {
        let connection = mysql.createConnection({
            host: database.HOST,
            user: database.USER,
            password: database.PASSWORD
        });

        it('Connection', function (done) {
            connection.connect(function (err) {
                if (err) done(err);

                assert.equal(connection.state, "connected");
                done()
            });
        });

        it(`Creating database "${database.DATABASE}"`, function (done) {
            connection.query(`CREATE DATABASE IF NOT EXISTS ${database.DATABASE};`, function (error, result) {
                if (error) done(error);
                assert.isObject(result);
                done();
            });
        });
    });
});