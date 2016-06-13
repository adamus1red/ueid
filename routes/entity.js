var express = require('express');
var leftpad = require('left-pad');
var router = express.Router();

var Common = require('../model/common'), Entity = require('../model/entity');

router.get('/test_create_entity', function(req,res,next) {
    var rand = Math.floor((Math.random() * 1048575) + 1)
    var test = new Entity({
        "entity": {
            "decimal": dec2hex(rand),
            "hex": hex2dec(rand),
            "fullUEID": "00:000001:" + hex2dec(rand)
        },
        "prefix": {
            "decimal": 1,
            "hex": "000001",
            "name": "Test Prefix",
            "description": "Prefix to be used for the development and testing of UEID systems",
            "type": {
                "hex": "00",
                "decimal": 0
            }
        }
    });
    test.save(function(err) {
      if (err) throw err;

      console.log('Entity saved successfully!');
    });
    res.send("Test object created");
    res.end();
});

router.get('/test_create_common', function(req,res,next) {
    var rand = Math.floor((Math.random() * 1048575) + 1)
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

      console.log('Entity saved successfully!');
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
    console.log(req.params.type);
    Common.findOne({"name": "types"}, function(err, data) {
        if (err) throw err;
        Entity.find({'prefix.type.hex':req.params.type}).distinct('prefix.hex', function(err,prefixi) {
            if (err) throw err;

            // object of all the stuff
            console.log(prefixi);
            if(prefixi.length>0 && prefixi != null){
                res.render('type', { title: 'Type Entity', type: req.params.type, data: data, prefixi: prefixi, user: req.user});
            } else {
                res.status(404).send('Not found');;
            }
        });
    });
});

router.get('/:type/:prefix', function(req, res, next) {
    Entity.find({'prefix.hex': req.params.prefix}, function(err,entities) {
        if (err) throw err;

        // object of all the stuff
        console.log(entities);
        if(entities.length>0 && entities != null){
            res.render('prefix', { title: 'Prefix Entity', type: req.params.type, prefix: req.params.prefix, entities: entities, user: req.user });
        } else {
            res.status(404)        // HTTP status 404: NotFound
   .send('Not found');
        }
    });
});

router.get('/:type/:prefix/:eid', function(req, res, next) {
    Entity.findOne({ 'entity.fullUEID': req.params.type + ":" + req.params.prefix + ":" + req.params.eid},  function(err,entity) {
        if (err) throw err;

        // object of all the stuff
        console.log(entity);
        if(entity != null) {
            res.render('entity', { title: 'Entity Info', entity: entity, type: req.params.type, prefix: req.params.prefix, eid: req.params.eid, user: req.user});
        } else {
            res.status(404)        // HTTP status 404: NotFound
   .send('Not found');
        }
    });
    
});

function objsort(a,b) {
    console.log(a.id + "\t" + b.id)
  if (a.id < b.id)
    return -1;
  else if (a.last_nom > b.last_nom)
    return 1;
  else 
    return 0;
}

function hex2dec(number){
    return number.toString(16);
}

function dec2hex(hex){
    return parseInt(hex, 16);
}

module.exports = router;