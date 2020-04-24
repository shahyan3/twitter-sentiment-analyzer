var express = require("express");
var router = express.Router();

var mysql = require("mysql");
var Sentiment = require("sentiment");
/*
    This router handles are **ONLY** incoming POST requests to the twitter-server.
*/

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log(req.body);
  res.send("analysis server!");
});
router.post("/", (req, res) => {
  // RECEIVE STREAM POST - Receiving Stream Data Posted via HTTP-Request FROM twitter-server
  if (req.body.tweet && req.body.filter) {
    // Do sentiment analysis
    let sentimentScore = sentimentAnalyze(req.body.tweet);
    try {
      // Save to Database
      addResultsToDB(req.body.filter, req.body.tweet, sentimentScore.score);
    } catch (error) {
      console.log("Failed to add results to db...", error);
    }
    // send a response
  } else if (req.body.query) {
    // get results from database from sentiment based on query and http request it to user-server
  } else {
    // throw an error?
    res.send("invalid request to analysis-server...");
  }
  res.send("succes: handled request");
});

// SEND QUERY POST - Sending the query from user-server via HTTP-Request TO twitter-server
function addResultsToDB(filter, tweet, sentimentScore) {
  // Get Sentiment Score of Tweet
  let post = { filter: filter, tweet: tweet, sentimentScore: sentimentScore };
  try {
    // MySQL INSERT query
    let query = connection.query(
      "INSERT INTO post_archive SET ?",
      post,
      function (error, results, fields) {
        if (error) throw error;
        console.log("Success: Added to DB");
      }
    );
  } catch (error) {
    console.log("DB Fail to Add:", err);
  }
}

function sentimentAnalyze(tweet) {
  var sentiment = new Sentiment();
  var result = sentiment.analyze(tweet);
  console.log(result); // Score: -2, Comparative: -0.666
  return result;
}

module.exports = router;
