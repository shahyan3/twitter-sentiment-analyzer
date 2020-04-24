var express = require("express");
var router = express.Router();

var request = require("request");
let score = "0";
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { score: score });
});

let on_stream = false;
router.post("/", (req, res) => {
  if (req.body.searchTerm) {
    console.log("starting Stream....");
    user_term = req.body.searchTerm;

    // 1) Convert query into JSON
    tweetJSON = { query: req.body.searchTerm };
    console.log("start search...", tweetJSON);

    // 2) Send via HTTP post request to the LOAD-BALANCER FOR TWITTER-SERVER
    request(
      {
        url: "http://52.26.216.28:3000",
        method: "POST",
        json: true,
        body: tweetJSON,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Query Sent...status", response.statusCode);
          on_stream = true;
        } else {
          console.log(
            "HTTP POST (start req): Sending tweets to twitter-server Failed",
            error
          );
        }
      }
    );
  } else if (req.body.stopSearch) {
    console.log("CLosing Stream....");
    // 1) Convert query into JSON
    tweetJSON = { query: req.body.stopSearch };
    console.log("Stop search...", tweetJSON);
    // 2) Send via HTTP post request to the LOAD-BALANCER FOR ANALYSIS-SERVER
    request(
      {
        url: "http://52.26.216.28:3000",
        method: "POST",
        json: true, // <--Very important!!!
        body: tweetJSON,
      },
      function (error, response, body) {
        console.log("Closing Stream Request Sent...");
        on_stream = false;
      }
    );
    // Request Sentiment Analysis Scores From Analysis-server via LOAD BALANCER
  } else if (req.body.sentimentFilter) {
    // 1) Convert Tweet into JSON
    tweetJSON = { sentimentFilter: req.body.sentimentFilter };
    console.log("Analyze this:", tweetJSON);

    // 2) Send via HTTP post request to the ANALYSIS-SERVER
    request(
      {
        url: "http://LoadBalancer-1284897978.us-west-2.elb.amazonaws.com",
        method: "POST",
        json: true, // <--Very important!!!
        body: tweetJSON,
      },
      function (error, response, body) {
        if (error) {
          console.log(
            "HTTP POST: Sending tweets to analysis-server Failed",
            error
          );
        } else {
          console.log("Success! Send sentiment request to analysis-server");
        }
      }
    );
    res.render("index");
  } else if (req.body.score) {
    score = req.body.score;
    console.log("posting score", req.body.score);
  } else {
    res.send("Null Response");
    console.log("nothing happened...");
  }
});

module.exports = router;
