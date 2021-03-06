module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        auth_id: {
            type: Sequelize.STRING,
            unique: true,
        },
        auth_key: {
            type: Sequelize.STRING,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
        },
        session_id: {
            type: Sequelize.STRING,
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    });

    return Users;
}