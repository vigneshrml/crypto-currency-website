var mongoose = require("mongoose");

var poolSchema  = new mongoose.Schema({
    pool : String,
    plan : String,
    percent : String,
    createdAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model("Pool",poolSchema);