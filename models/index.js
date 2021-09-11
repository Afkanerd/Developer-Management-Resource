const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.database.DATABASE, configs.database.USER, configs.database.PASSWORD, {
    host: configs.database.HOST,
    dialect: "mysql",
    logging: false,
    // define: {
    //     timestamps: false
    // }
});

var db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);
db.projects = require("./projects.model.js")(sequelize, Sequelize);

// relationship users table -> tokens table 
db.users.hasMany(db.projects, {
    foreignKey: "userId"
});
db.projects.belongsTo(db.users);

module.exports = db;