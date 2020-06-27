const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname:{
        type: String,
        default: ''
    },
    firstname:{
        type: String,
        default: ''
    },
    lastname:{
        type: String,
        default: ''
    },
    email:{
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    facebook: {
        type: String
    },
    google: {
        type: String
    },
    instagram: {
        type: String
    },
    fbTokens: Array,
    phone: {
        type: Number
    },
    lacation: {
        type: String
    }
});

//creat user collection
module.exports = mongoose.model('user', userSchema); 