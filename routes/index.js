var express = require('express');
var router = express.Router();
var Entity = require('../model/entity');

/* GET home page. */
router.get('/', function(req, res, next) {
    Entity.find({}).sort({created: -1}).limit(10).populate("prefix").exec(function(err, entity) { 
        if(err)
            res.status(500).render('error', {message: err.message,error: err});

        res.render('index', { title: 'Express', user: req.user, entityLatest: entity });
    });
});
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About UEID', user: req.user });
});
router.get('/logout', function(req, res, next) {
    // LOGOUT ==============================
        req.logout();
        res.redirect('/');
})

module.exports = router;
