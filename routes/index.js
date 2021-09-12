const Security = require("../models/security.model.js");
const security = new Security()
const {
    ErrorHandler
} = require('../error.js');
const {
    v4: uuidv4,
    v1: uuidv1
} = require('uuid');
const {
    Op,
    QueryTypes
} = require("sequelize");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

module.exports = (app, configs, db) => {
    var User = db.users;
    var Project = db.projects;

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    };

    app.post("/users/authentication", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.project_id) {
                throw new ErrorHandler(400, "Project_id cannot be empty");
            };

            if (!req.body.scope) {
                throw new ErrorHandler(400, "scope cannot be empty");
            };
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    [Op.and]: [{
                        auth_key: req.body.auth_key
                    }, {
                        auth_id: req.body.auth_id
                    }]
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF USER NOT FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            for (let i = 0; i < req.body.scope.length; i++) {
                if (user[0].scope.includes(req.body.scope[i])) {
                    continue;
                } else {
                    throw new ErrorHandler(401, `INVALID SCOPE "${req.body.scope[i]}"`);
                }
            }

            // GET ALL TOKENS UNDER CURRENT USER
            let project = await user[0].getProjects({
                where: {
                    id: req.body.project_id
                }
            });

            // RETURN = [], IF NO TOKEN EXIST UNDER CURRENT USER
            if (project.length < 1) {
                throw new ErrorHandler(401, "INVALID PROJECT_ID");
            }

            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(true)
        } catch (error) {
            next(error)
        }
    });


    app.post("/users/create", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
            };

            if (!req.body.scope) {
                throw new ErrorHandler(400, "scope cannot be empty");
            };
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    email: req.body.email
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 0) {
                throw new ErrorHandler(409, "Duplicate Users");
            };

            if (Array.isArray(req.body.scope) == false) {
                throw new ErrorHandler(401, "SCOPE MOST BE ARRAY OF STRINGS");
            }

            let newUser = await User.create({
                auth_id: security.hash(uuidv4()),
                auth_key: security.hash(uuidv1()),
                email: req.body.email,
                scope: req.body.scope
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(newUser)
        } catch (error) {
            next(error)
        }
    })
}