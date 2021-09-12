module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        auth_id: {
            type: Sequelize.STRING,
            unique: true
        },
        auth_key: {
            type: Sequelize.STRING,
            unique: true
        },
        scope: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            unique: true
        }
    });

    return Users;
}