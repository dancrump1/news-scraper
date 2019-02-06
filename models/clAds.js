let mongoose = require("mongoose");

let Schema = mongoose.Schema;


let ClAdsSchema = new Schema ({
    title: String,
    price: String
    //would have linked comments here w/ ref: Comments
});

let ClAds = mongoose.model("ClAds", ClAdsSchema);

module.exports = ClAds;