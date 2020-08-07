// add styling to dashboard, make responsive 



const express = require('express')
const router = express.Router();

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/Login");
    } else {
        next();
    }
}

router.get("/Customer", ensureLogin, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard Page",
        user: req.session.user
    });
});

function ensureAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.admin) {
        res.redirect("/Login");
    } else {
        next();
    }
}

router.get("/DataClerk", ensureAdmin, (req, res) => {
    res.render("dashboard", {
        title: "Clerk Dashboard Page",
        user: req.session.user
    });
});



router.get("/Logout", function(req, res) {
    req.session.reset();
    res.redirect("/Login");
});

module.exports = router;