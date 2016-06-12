var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', loggedIn, function(req, res, next) {
  res.send(JSON.stringify(req.user, null, '    '));
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = router;
