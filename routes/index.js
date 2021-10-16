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
var generator = require('generate-password');

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

module.exports = (app, configs, db) => {
    var User = db.users;
    var Project = db.projects;
    var usersProjects = db.usersProjects;
    var mysql = db.sequelize

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    };


    app.post("/auth/users/:user_id", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.params.user_id) {
                throw new ErrorHandler(400, "user_id cannot be empty");
            };

            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.params.user_id
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

            return res.status(200).json(true)
        } catch (error) {
            next(error)
        }
    });

    app.post("/auth/users/:user_id/projects/:project_id", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.scope) {
                throw new ErrorHandler(400, "scope cannot be empty");
            };

            if (!req.params.user_id) {
                throw new ErrorHandler(400, "user_id cannot be empty");
            };

            if (!req.params.project_id) {
                throw new ErrorHandler(400, "project_id cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.params.user_id
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

            if (Array.isArray(req.body.scope) == false) {
                throw new ErrorHandler(401, "SCOPE MOST BE ARRAY OF STRINGS");
            }

            let projectCheck = await Project.findAll({
                where: {
                    id: req.params.project_id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (projectCheck.length < 1) {
                throw new ErrorHandler(401, "INVALID PROJECT_ID");
            }

            if (projectCheck.length > 1) {
                throw new ErrorHandler(409, "Duplicate Projects");
            }

            let project = await usersProjects.findAll({
                where: {
                    userId: user[0].id,
                    projectId: projectCheck[0].id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (project.length < 1) {
                throw new ErrorHandler(403, "You're not allowed to access this project");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (project.length > 1) {
                throw new ErrorHandler(409, "Duplicate User/Projects record");
            }

            let userScope = project[0].scope.split(",");

            for (let i = 0; i < req.body.scope.length; i++) {
                if (userScope.includes(req.body.scope[i])) {
                    continue;
                } else {
                    throw new ErrorHandler(401, `INVALID SCOPE '${req.body.scope[i]}'`);
                }
            }

            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(true)
        } catch (error) {
            next(error)
        }
    });


    app.post("/users", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

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

            let password = "";

            if (req.body.password) {
                password = req.body.password
            } else {
                password = generator.generate({
                    length: 10,
                    numbers: true,
                    symbols: true,
                    lowercase: true,
                    uppercase: true
                });
            }

            let newUser = await User.create({
                auth_id: security.hash(uuidv4()),
                auth_key: security.hash(uuidv1()),
                email: req.body.email,
                password: password
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json(newUser)
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/profile", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    email: req.body.email
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (user.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            if (user.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            return res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    })

    app.post("/projects", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.project_name) {
                throw new ErrorHandler(400, "Project_name cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            let project_check = await Project.findAll({
                where: {
                    name: req.body.project_name
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (project_check.length > 0) {
                throw new ErrorHandler(409, "Duplicate Projects");
            }

            let newProject = await Project.create({
                name: req.body.project_name,
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(newProject)
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/:user_id/projects", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.params.user_id) {
                throw new ErrorHandler(400, "User_id cannot be empty");
            };

            if (!req.body.project_id) {
                throw new ErrorHandler(400, "Project_id cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.params.user_id
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

            let usersProject = await Project.findAll({
                where: {
                    id: req.body.project_id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (usersProject.length < 1) {
                throw new ErrorHandler(401, "Project doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (usersProject.length > 1) {
                throw new ErrorHandler(409, "Duplicate Projects");
            }

            let project = await usersProjects.findAll({
                where: {
                    userId: user[0].id,
                    projectId: usersProject[0].id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF RETURN HAS MORE THAN ONE ITEM
            if (project.length > 0) {
                throw new ErrorHandler(409, "User already has this Project added");
            }

            let newProject = await usersProjects.create({
                userId: user[0].id,
                projectId: usersProject[0].id
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json(newProject)
        } catch (error) {
            next(error)
        }
    });

    app.put("/users/:user_id/projects/:project_id/scopes", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.body.scope) {
                throw new ErrorHandler(400, "Scope cannot be empty");
            };

            if (!req.params.user_id) {
                throw new ErrorHandler(400, "User_id cannot be empty");
            };

            if (!req.params.project_id) {
                throw new ErrorHandler(400, "Project_id cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.params.user_id
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

            if (Array.isArray(req.body.scope) == false) {
                throw new ErrorHandler(401, "SCOPE MOST BE ARRAY OF STRINGS");
            }

            let projectCheck = await Project.findAll({
                where: {
                    id: req.params.project_id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (projectCheck.length < 1) {
                throw new ErrorHandler(401, "INVALID PROJECT_ID");
            }

            if (projectCheck.length > 1) {
                throw new ErrorHandler(409, "Duplicate Projects");
            }

            let project = await usersProjects.findAll({
                where: {
                    userId: user[0].id,
                    projectId: projectCheck[0].id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (project.length < 1) {
                throw new ErrorHandler(401, "User/Project record doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (project.length > 1) {
                throw new ErrorHandler(409, "Duplicate User/Projects record");
            }

            let newScope = await project[0].update({
                scope: req.body.scope.toString()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json(newScope)
        } catch (error) {
            next(error)
        }
    })

    app.put("/projects/:project_id/name", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.auth_id) {
                throw new ErrorHandler(400, "Auth_id cannot be empty");
            };

            if (!req.params.project_id) {
                throw new ErrorHandler(400, "Project_id cannot be empty");
            };

            if (!req.body.project_name) {
                throw new ErrorHandler(400, "Project_name cannot be empty");
            };
            // =============================================================

            // VERIFY ADMIN
            let admin = await mysql.query(`SELECT * FROM admins WHERE auth_id = ? AND auth_key = ?`, {
                replacements: [req.body.auth_id, req.body.auth_key],
                type: QueryTypes.SELECT
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF ADMIN NOT FOUND
            if (admin.length < 1) {
                throw new ErrorHandler(401, "Admin doesn't exist (Unauthorized)");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (admin.length > 1) {
                throw new ErrorHandler(409, "Duplicate Admins (Forbidden)");
            }

            let project = await Project.findAll({
                where: {
                    id: req.params.project_id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (project.length < 1) {
                throw new ErrorHandler(401, "INVALID PROJECT_ID");
            }

            if (project.length > 1) {
                throw new ErrorHandler(409, "Duplicate Projects");
            }

            let newProject = await project[0].update({
                name: req.body.project_name,
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json(newProject)
        } catch (error) {
            next(error)
        }
    });
}