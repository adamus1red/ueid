var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

module.exports = function(app, passport) {
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login/', csrfProtection, function(req, res) {
            res.render('login.ejs', { csrfToken: req.csrfToken(), title: "Login" });
        });

        
        // process the login form
        app.post('/login/', csrfProtection, passport.authenticate('local-login', {
            successRedirect : '/users', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/login/signup', csrfProtection, function(req, res) {
            res.render('signup.ejs', { csrfToken: req.csrfToken(), title: "Signup" });
        });

        // process the signup form
        app.post('/login/signup', csrfProtection, passport.authenticate('local-signup', {
            successRedirect : '/users', // redirect to the secure profile section
            failureRedirect : '/login/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
//module.exports = router;
