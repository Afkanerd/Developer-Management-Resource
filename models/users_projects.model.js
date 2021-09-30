module.exports = (sequelize, Sequelize) => {
    let usersProjects = sequelize.define("users_projects", {
        userId: {
            type: Sequelize.STRING
        },
        projectId: {
            type: Sequelize.STRING
        },
        scope: {
            type: Sequelize.TEXT,
            defaultValue: "read",
            allowNull: false
        }
    });

    return usersProjects;
}