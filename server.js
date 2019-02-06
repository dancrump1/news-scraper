var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require("mongoose");


var app = express();

var databaseUrl = "CLads";
var collections = ["scrapedData"];

var PORT = process.env.PORT || 3000;


app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var db = mongojs(databaseUrl, collections);

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});

db.on("error", error => console.log("Database error: " + error));

app.get("/", function (req, res) {
    res.json("hello world");
});

app.get("/listings", function (req, res) {
    db.scrapedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        } else {
            res.json(found);
        }
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://nh.craigslist.org/d/computer-parts/search/syp").then(response => {
        var $ = cheerio.load(response.data);
        var results = [];

        $("p.result-info").each((i, element) => {
            var title = $(element).children("a.result-title").text();
            var price = $(element).children("span.result-meta").children("span.result-price").text();
            results.push({
                title: title,
                price: price
            });

        });
       

        console.log(results);
        db.scrapedData.insert(results);
    })
    
})

app.listen(PORT, console.log("App running on port: " + PORT))