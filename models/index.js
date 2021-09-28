const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.database.MYSQL_DATABASE, configs.database.MYSQL_USER, configs.database.MYSQL_PASSWORD, {
    host: configs.database.MYSQL_HOST,
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
db.usersProjects = require("./users_projects.model.js")(sequelize, Sequelize);

// relationship users table -> tokens table 
db.users.belongsToMany(db.projects, {
    through: "users_projects",
    foreignKey: "userId"
});

db.projects.belongsToMany(db.users, {
    through: "users_projects",
    foreignKey: "projectId"
});

module.exports = db;