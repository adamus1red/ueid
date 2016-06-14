// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our model
var prefix = new Schema({
    "decimal": Number,
    "hex": String,
    "name": String,
    "description": String,
    "owner" : {
        type : ObjectId,
        ref: 'User'
    },
    "type": {
        "hex": String,
        "decimal": Number
    }
});

module.exports = mongoose.model('Prefix', prefix);