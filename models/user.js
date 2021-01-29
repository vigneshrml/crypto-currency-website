var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    sponsor     :String,
    name        :String,
    username    :String,
    password    :String,
    role      : {
        type:Boolean,
        default:false
    },
    bitcoin     :String,
    ethereum    :String,
    litecoin    :String,
    tron        :String,
    createdAt: {type: Date, default: Date.now}
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);