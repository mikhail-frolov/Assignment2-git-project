const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const db = require("./model/db");
const clientSessions = require("client-sessions");

//load environment varibale file
require('dotenv').config({ path: "./config/keys.env" });

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

//Use handlebars template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "assignment3_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

let ensureLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect("/login/login");
    } else {
        next();
    }
};

//load controllers
const generalController = require("./controller/general");
const formsController = require("./controller/registration");
const loginController = require("./controller/login");


app.use("/", generalController);
app.use("/Registration", formsController);
app.use("/Login", loginController);


db.initialize()
    .then(() => {

        console.log("Great Success!");
        app.listen(PORT, () => {
            console.log("Web-Server is up and running!");
        })
    })
    .catch((err) => {
        console.log(err);
    });