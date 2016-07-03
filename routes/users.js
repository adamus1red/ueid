var express = require('express');
var router = express.Router();
var validator = require('validator');
var Common = require('../model/common'), Entity = require('../model/entity'), Prefix = require('../model/prefix'), User = require('../model/user');
/* GET users listing. */
router.get('/', loggedIn, function(req, res, next) {
    User.findOne({'username': req.user.username}, function(err,us) {
        if(err) {
            res.status(500).send("Error looking up user");
        }
        Prefix.find({'owner': us._id}, function(err,prefixes){
            if(err) {
                res.status(500).send("Error looking up assigned prefixes");
            }
            res.render('userProfile', {title: "User Profile" + req.params.user, user: req.user, assignedPrefixes: prefixes, username: us});
        });
    });
});
// User dashboard
router.get('/dashboard', loggedIn, function(req, res, next) {
    res.send(JSON.stringify(req.user, null, '    '));
});
// Public profile
router.get('/:user', function(req, res, next) {
    User.findOne({'username': req.params.user}, function(err,us) {
        if(err) {
            res.status(500).send("Error looking up user");
        }
        Prefix.find({'owner': us._id}, function(err,prefixes){
            if(err) {
                res.status(500).send("Error looking up assigned prefixes");
            }
            res.render('userProfile', {title: "User Profile" + req.params.user, user: req.user, assignedPrefixes: prefixes, username: us});
        });
    });
    
  
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = router;
