// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our model
var entity = new Schema({

    prefix           : {
        decimal      : Number,
        hex          : String,
        type: {
            hex      : String,
            decimal  : Number
        },
        name         : String,
        description  : String,
        owner        : ObjectId
    },
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
