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
    var usersProjects = db.usersProjects;

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    };

    app.post("/users/:user_id/projects/:project_id/authenticate", async (req, res, next) => {
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

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    [Op.and]: [{
                        auth_key: req.body.auth_key
                    }, {
                        auth_id: req.body.auth_id
                    }, {
                        id: req.params.user_id
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
            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
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

            let newUser = await User.create({
                auth_id: security.hash(uuidv4()),
                auth_key: security.hash(uuidv1()),
                email: req.body.email
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json(newUser)
        } catch (error) {
            next(error)
        }
    })

    app.post("/projects", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.project_name) {
                throw new ErrorHandler(400, "Project_name cannot be empty");
            };
            // =============================================================

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

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    [Op.and]: [{
                        auth_key: req.body.auth_key
                    }, {
                        auth_id: req.body.auth_id
                    }, {
                        id: req.params.user_id
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
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    [Op.and]: [{
                        auth_key: req.body.auth_key
                    }, {
                        auth_id: req.body.auth_id
                    }, {
                        id: req.params.user_id
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
            if (!req.params.project_id) {
                throw new ErrorHandler(400, "Project_id cannot be empty");
            };

            if (!req.body.project_name) {
                throw new ErrorHandler(400, "Project_name cannot be empty");
            };
            // =============================================================

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