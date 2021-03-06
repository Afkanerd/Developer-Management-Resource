const configs = require("./config.json");
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const morgan = require("morgan");
const cors = require("cors");
const {
    handleError,
    ErrorHandler
} = require("./error.js");
const fs = require("fs");
const db = require("./models");

const swaggerDocument = require("./openapi.json");

const https = require("https")

var app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Create swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // logger
// var successLogStream = fs.createWriteStream(path.join(__dirname, "logs/success.log"), {
//     flags: 'a'
// })
// var errorLogStream = fs.createWriteStream(path.join(__dirname, "logs/error.log"), {
//     flags: 'a'
// });

// // setup the logger middleware
// app.use([morgan('combined', {
//         skip: function (req, res) {
//             return (res.statusCode <= 599 && res.statusCode >= 400)
//         },
//         stream: successLogStream
//     }),
//     morgan('combined', {
//         skip: function (req, res) {
//             return (res.statusCode <= 399 && res.statusCode >= 100)
//         },
//         stream: errorLogStream
//     })
// ]);

app.use(morgan('dev'));

// ROUTES
require("./routes")(app, configs, db);

// error handler
let errorHandler = (err, req, res, next) => {
    if (err.statusCode) {
        return handleError(err, res);
    };

    console.error(err)
}

app.use(errorHandler);

var httpsServer = ""
let server = () => {
    if ((configs.hasOwnProperty("ssl_api")) && fs.existsSync(configs.ssl_api.CERTIFICATE) && fs.existsSync(configs.ssl_api.KEY) && fs.existsSync(configs.ssl_api.PEM)) {
        let privateKey = fs.readFileSync(configs.ssl_api.KEY, 'utf8');
        let certificate = fs.readFileSync(configs.ssl_api.CERTIFICATE, 'utf8');
        // let certificate = fs.readFileSync(configs.ssl_api.PEM, 'utf8');
        let ca = [
            fs.readFileSync(configs.ssl_api.PEM)
        ]
        let credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };
        httpsServer = https.createServer(credentials, app);
        httpsServer.listen(configs.ssl_api.API_PORT);
        console.log("Production [+] Running secured on port:", configs.ssl_api.API_PORT)
        app.runningPort = configs.ssl_api.API_PORT
        app.is_ssl = true
    } else {
        console.log("Production [+] Running in-secured on port:", configs.api.API_PORT)
        app.listen(configs.api.API_PORT, console.log(`Prodcution server is running on port ${configs.api.API_PORT}`));
        app.runningPort = configs.api.API_PORT
        app.is_ssl = false
    }
}

module.exports = server;