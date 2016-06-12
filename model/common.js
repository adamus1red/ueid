// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our model
var common = new Schema({

    name: String,
    data: Object
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Common', common);
