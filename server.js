let cheerio = require("cheerio");
let axios = require("axios");
let express = require("express");
let mongoose = require("mongoose");
var exphbs = require("express-handlebars");

let PORT = process.env.PORT || 3000;
let app = express();
app.use(express.urlencoded({
    extended: true
}));
// app.use(express.json());
// // Make public a static folder
// app.use(express.static("public"));
// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");



let db = require("./models");
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/clAds";
// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});

app.get("/", function (req, res) {
    res.render("landing")
})

app.get("/listings", function (req, res) {

    db.ClAds.find({}, function (error, found) {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < found.length; i++) {
                res.render("templet");
                //res.json(found);
            }
        }
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://nh.craigslist.org/d/computer-parts/search/syp").then(response => {
        let $ = cheerio.load(response.data);
        

        $("p.result-info").each((i, element) => {
            let results = [];
            let title = $(element).children("a.result-title").text();
            let price = $(element).children("span.result-meta").children("span.result-price").text();
            results.push({
                title: title,
                price: price
            });
            console.log(results);
            db.ClAds.insert(results)
                .then(dbAds => console.log(dbAds))
                .catch(err => console.log(err));
        })
        });
        
    res.send("Scrape complete!")
})

app.listen(PORT, console.log("App running on port: " + PORT))