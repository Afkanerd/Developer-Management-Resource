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
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    });

    return usersProjects;
}