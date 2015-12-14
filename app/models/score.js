var mongoose = require('mongoose');

module.exports = mongoose.model('Score', mongoose.Schema({
    name: {
        type: String,
        default: "NoName"
    },
    score: {
        type: Number,
        default: 0
    }
}));