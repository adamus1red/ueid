// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our model
var entity = new Schema({

    prefix           : {
        type : ObjectId,
        ref: 'Prefix'
    },
    "created" : { type: Date, default: Date.now },
    entity           : {
        decimal      : Number,
        hex          : String,
        fullUEID     : String,
        description  : String,
        email        : String,
        name         : String
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Entity', entity);
