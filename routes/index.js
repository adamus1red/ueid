var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
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
