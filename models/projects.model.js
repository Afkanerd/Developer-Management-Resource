module.exports = (sequelize, Sequelize) => {
    let Projects = sequelize.define("projects", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            unique: true
        }
    });

    return Projects;
}