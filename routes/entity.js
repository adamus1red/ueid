var express = require('express');
var leftpad = require('left-pad');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var validator = require('validator');
var purify = require('dompurify');

var Common = require('../model/common'), Entity = require('../model/entity'), Prefix = require('../model/prefix');

router.get('/admin/prefix', function(req,res,next) {
    Common.findOne({"name": "types"}).sort({'data.id': 1}).exec(function(err, typeData) {
        if (err) throw err;

        res.render('e/prefix', { title: 'Prefix Request', user: req.user, types:typeData.data, e: ""});
    });
    
});

router.post('/admin/prefix', function(req,res,next) {
    // Add checks for input
    var eState = "";
    if(typeof req.body.description === "undefined" || req.body.description === "") { // check a description has been provided
        eState += "d";
    }
    if(typeof req.body.ptype === "undefined") {
        eState += "t";
    }
    //console.log(JSON.stringify(req.body));
    if(eState === "") {
        
    } else {
        Common.findOne({"name": "types"}).sort({'data.id': 1}).exec(function(err, typeData) {
            if (err) throw err;

            res.render('e/prefix', { title: 'Prefix Request', user: req.user, types:typeData.data, e: eState });
        });
    }
});

router.get('/test_create_entity', function(req,res,next) {
    var rand = Math.floor((Math.random() * hex2dec("FFFFF")) + 1);
    Prefix.find({}, function(err, data) {
        if(err)
            res.status(500).render('error', {message: err.message,error: err});

        var id = Math.floor((Math.random() * data.length))
        var test = new Entity({
            "entity": {
                "decimal": rand,
                "hex": dec2hex(rand),
                "fullUEID": "00:"+data[id].hex.toLowerCase()+":" + dec2hex(rand)
            },
            "prefix": data[id]._id
        });
        test.save(function(err) {
          if (err) throw err;

          //console.log('Entity saved successfully!');
        });
    });
    
    res.send("Test object created");
    res.end();
});

router.get('/test_create_prefix', function(req,res,next) {
    var rand = Math.floor((Math.random() * hex2dec("FFFFFF")) + 1);
    var test = new Prefix({
        "decimal": rand,
        "owner" :  "575de2ce690540882cfc0018",
        "hex": dec2hex(rand),
        "name": "Test Prefix",
        "description": "Prefix to be used for the development and testing of UEID systems",
        "type": {
            "hex": "00",
            "decimal": 0
        }
    });
    test.save(function(err) {
      if (err) throw err;

      //console.log('Entity saved successfully!');
    });
    res.send("Test object created");
    res.end();
});

router.get('/test_create_common', function(req,res,next) {
    var test = new Common({
        "name": "types",
        "data": [
            {
                "id": "02",
                "name": "Self Pub"
            },
            {
                "id": "01",
                "name": "ISBN"
            },
            {
                "id": "00",
                "name": "Test Cat"
            }
        ]
    });
    test.save(function(err) {
      if (err) throw err;

      //console.log('Entity saved successfully!');
    });
    res.send("Test object created");
    res.end();
});

router.get('/', function(req, res, next) {
    Common.findOne({"name": "types"}, function(err, data) {
        if (err) throw err;

        res.render('category', { title: 'Type Entity', data: data.data.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0);} ), user: req.user});
    });
});

router.get('/:type', function(req,res,next) {
    Common.findOne({"name": "types"}, function(err, data) {
        if(err)
            res.status(500).render('error', {message: err.message,error: err});
        Prefix.find({"type.hex": leftpad(req.params.type.toLowerCase(), 2, 0)}).sort({'hex': 1}).populate('owner').exec(function(err, prefix) {
            //console.log(data);
            if(prefix.length>0 && prefix != null){
                res.render('type', { title: 'Type Entity', type: req.params.type, data: data, prefixi: prefix, user: req.user});
            } else {
                res.status(404).render('404', {title: "Page not found!", message: "Not Found", error: {status: "404"}, user: req.user})
            }
        });
    });
});

router.get('/:type/:prefix', function(req, res, next) {
    //console.log(leftpad(req.params.prefix.toLowerCase(), 6, 0));
    Prefix.findOne({'hex': leftpad(req.params.prefix.toLowerCase(), 6, 0), 'type.hex': leftpad(req.params.type.toLowerCase(), 2, 0)}).populate('owner').sort({'hex': 1}).exec(function(err,prefix) {
        if(err)
            res.status(500).render('error', {message: err.message,error: err});
        //console.log("prefix: " + JSON.stringify(prefix));
        if(prefix != null) {
            Entity.find({"prefix":prefix._id}).populate('prefix').exec(function (err, entity) {
                if (err) throw err;
                // object of all the stuff
                //console.log("Entity " + JSON.stringify(entity));
                if (entity === []) {
                    res.render('prefix', { title: 'Prefix Entity', type: req.params.type, prefix: prefix, entities: null, user: req.user });
                } else if(typeof entity != "undefined" && entity != null && entity != []){
                    res.render('prefix', { title: 'Prefix Entity', type: req.params.type, prefix: prefix, entities: entity, user: req.user });
                } else {
                    res.send("Something has gone terribly wrong! If you see this please quote 'ee553' if making a bug report");
                }
            });
        } else {
            res.status(404).render('prefixNotFound', { title: 'Prefix ', type: leftpad(req.params.type.toLowerCase(), 2, 0), prefix: leftpad(req.params.prefix.toLowerCase(), 6, 0), user: req.user });
        }
    });
});

router.get('/:type/:prefix/:eid', function(req, res, next) {
    Entity.findOne({ 'entity.fullUEID': leftpad(req.params.type.toLowerCase(), 2, 0) + ":" + leftpad(req.params.prefix.toLowerCase(), 6, 0) + ":" + leftpad(req.params.eid.toLowerCase(),5,0)}).populate('prefix').exec( function(err,entity) {
        if(err)
            res.status(500).render('error', {message: err.message,error: err});

        // object of all the stuff
        //console.log(entity);
        if(entity != null) {
            res.render('entity', { title: 'Entity Info', entity: entity, type: req.params.type, prefix: req.params.prefix, eid: req.params.eid, user: req.user });
        } else {
            res.status(404).render('entityNotFound', { title: 'Entity ', type: leftpad(req.params.type.toLowerCase(), 2, 0), prefix: leftpad(req.params.prefix.toLowerCase(), 6, 0), entity:leftpad(req.params.eid.toLowerCase(),5,0), user: req.user });
        }
    });
    
});

function objsort(a,b) {
    //console.log(a.id + "\t" + b.id)
  if (a.id < b.id)
    return -1;
  else if (a.last_nom > b.last_nom)
    return 1;
  else 
    return 0;
}

function getPrefixInfo(prefixHex) {
    var q = Entity.findOne({'prefix.hex': prefixHex});
    return q;
}

function dec2hex(number){
    return number.toString(16).toLowerCase();
}

function hex2dec(hex){
    return parseInt(hex.toLowerCase(), 16);
}

module.exports = router;