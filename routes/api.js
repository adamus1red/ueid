var express = require('express');
var router = express.Router();
var Common = require('../model/common'), Entity = require('../model/entity'), Prefix = require('../model/prefix'), User = require('../model/user');

var sessioncache = require('apicache').options({ debug: true,appendKey: ['session', 'id'] }).middleware;

var publiccache = require('apicache').options({ debug: true, appendKey: false }).middleware;

/*
 * Response codes:
 * 00: No Error
 * 01: Lookup Error
 * 02: Invalid input
 * 03: No output
 * 04: Not found
 
 */

router.get('/v1/:user', publiccache('1 hour'), function(req, res, next) {
    User.findOne({'username': req.params.user}, function(err,us) {
        if(err) {
            res.status(500).send({"code": 1,"message": "User lookup error", "fields": "user"});
        }else if(us === null) {
            res.send({"code": 2,"message": "User not valid", "fields": "user"});
        } else {
            Prefix.find({'owner': us._id}).lean().exec(function(err,prefixes){
                if(err) {
                    res.status(500).send("Error looking up assigned prefixes");
                }
                var response = prefixes;
                for(var i = 0; i < response.length; i++) {
                    delete response[i]._id;
                    delete response[i].__v;
                    response[i].owner = us.username;
                }
                
                res.send(JSON.stringify(response));
            });
        }
    });
});

router.get('/v1/:user/:type/:prefix', publiccache('1 hour'), function(req, res, next) {
    User.findOne({'username': req.params.user}, function(err,us) {
        if(err) {
            res.status(500).send({"code": 1,"message": "Prefix not valid", "fields": "user"});
        } else if(!isHex(req.params.prefix)) {
            res.status(500).send({"code": 2,"message": "Prefix not valid", "fields": "prefix"});
        } else {
            Prefix.findOne({'owner': us._id, 'type.hex': req.params.type, 'hex': req.params.prefix}).exec(function(err,prefix){
                if(err) {
                    res.status(500).send("Error looking up assigned prefixes");
                }
                if(prefix === null) {
                    res.send([])
                } else {
                    Entity.find({'prefix': prefix._id}).populate('prefix').lean().exec(function(err,e) {
                        if(err) {
                            res.status(500).send("Error looking up entites");
                        }
                        var response = e;
                        for(var i = 0; i < e.length; i++) {
                            delete e[i]._id;
                            delete e[i].__v;
                            delete e[i].prefix._id;
                            delete e[i].prefix.__v;
                            response[i].prefix.owner = us.username;
                        }
                        
                        res.send(JSON.stringify(response));
                    });
                }
            });
        }
    });
});

// GET apicache index (for the curious) 
router.get('/cache/index', function(req, res, next) {
    res.send(apicache.getIndex());
});
 
// GET apicache index (for the curious) 
router.get('/cache/clear/:key?', function(req, res, next) {
    res.send(200, ApiCache.clear(req.params.key || req.query.key));
});

router.get('/*', sessioncache('1 hour'), function(req, res, next) {
    res.status(404).send({"code": 4,"message": "Not Found/Invalid Endpoint", "fields": null});
});
function isHex(h) {
    var a = parseInt(h,16);
    return (a.toString(16) === h)
}
module.exports = router;
