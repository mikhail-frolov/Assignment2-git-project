const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const db = require("./model/db");
const clientSessions = require("client-sessions");

const path = require("path");

//load environment varibale file
require('dotenv').config({ path: "./config/keys.env" });

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

//Use handlebars template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "assignment3_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));



const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    } else {
        return cb(new Error('Not an image! Please upload an image.', 400), false);
    }
};

// tell multer to use the diskStorage function for naming files instead of the default.


//load controllers
const generalController = require("./controller/general");
const formsController = require("./controller/registration");
const loginController = require("./controller/login");
const dashboardController = require("./controller/dboard");

app.use("/", generalController);
app.use("/Registration", formsController);
app.use("/Login", loginController);
app.use("/Dashboard", dashboardController);

db.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Web-Server is up and running!");
        })
    })
    .catch((err) => {
        console.log(err);
    });