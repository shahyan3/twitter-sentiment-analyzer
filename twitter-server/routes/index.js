var express = require("express");
var router = express.Router();

const Twitter = require("twitter");
var request = require("request");
var bodyParser = require("body-parser");

/* Middleware Parser */
router.use(bodyParser.json()); // to support JSON-encoded bodies
router.use(
  bodyParser.urlencoded({
    extended: true, // to support URL-encoded bodies
  })
);

/* TWITTER AUTH */

var client = new Twitter({
  consumer_key: "xx",
  consumer_secret: "xx",
  access_token_key: "xx-xx",
  access_token_secret: "xx",
});

let on_stream = "off";
let _stream = {};
/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

// Receiving LOCAL requests to the twitter-server - query
router.post("/", (req, res) => {
  if (req.body.query !== "stopSearch") {
    startStream(req.body.query);
    res.send("Query Searched: " + req.body.query);
  } else if (req.body.query === "stopSearch") {
    closeStream(req.body.query);
    res.send("Query: " + req.body.query);
  } else {
    res.send("Invalid post request: " + req.body.query);
  }
});
// Calls the twitter stream api, starts streaming based on the JSON queried term, SENDS tweets to analysis-server
function startStream(term) {
  client.stream("statuses/filter", { track: term }, function (stream) {
    _stream = stream;
    on_stream = "on";

    console.log("Twitter-Server: starting stream...");
    try {
      _stream.on("data", function (tweet) {
        console.log(tweet.text + "Streaming");

        // 1) Convert Tweet into JSON
        tweetJSON = { tweet: tweet.text, filter: term };
        // 2) Send via HTTP post request to the ANALYSIS-SERVER
        request(
          {
            url: "http://LoadBalancer-1284897978.us-west-2.elb.amazonaws.com",
            method: "POST",
            json: true, // <--Very important!!!
            body: tweetJSON,
          },
          function (error, response, body) {
            console.log(
              "HTTP POST: Sending tweets to analysis-server Failed",
              error
            );
          }
        );
      });

      _stream.on("error", function (error) {
        console.log("erorr:: " + error);
        throw error;
      });
    } catch (error) {
      console.log("tweet ERROR! CAUGHT!", error);
    }
  });
}
// Close twitter stream
function closeStream(stopSearchQuery) {
  console.log("Twitter-Server: Closing stream...");
  // stop the analysis request
  // 1) Convert Tweet into JSON
  tweetJSON = { tweet: "NUll", filter: stopSearchQuery };
  console.log(tweetJSON);
  // 2) Send via HTTP post request to the ANALYSIS-SERVER
  request(
    {
      url: "http://LoadBalancer-1284897978.us-west-2.elb.amazonaws.com",
      method: "POST",
      json: true, // <--Very important!!!
      body: tweetJSON,
    },
    function (error, response, body) {
      console.log("HTTP POST: stopSearch req to analysis-server Failed", error);
    }
  );

  _stream.destroy();
  on_stream = "off";

  console.log("close stream: ", on_stream);
}

module.exports = router;
