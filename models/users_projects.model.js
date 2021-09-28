module.exports = (sequelize, Sequelize) => {
    let usersProjects = sequelize.define("users_projects", {
        userId: {
            type: Sequelize.STRING
        },
        projectId: {
            type: Sequelize.STRING
        }
    });

    return usersProjects;
}