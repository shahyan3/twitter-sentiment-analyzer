var express = require("express");
var router = express.Router();

var express = require("express");
var router = express.Router();

var mysql = require("mysql");
var Sentiment = require("sentiment");
var bodyParser = require("body-parser");

var request = require("request");
var ss = require("simple-statistics");

/* Middleware Parser */
router.use(bodyParser.json()); // to support JSON-encoded bodies
router.use(
  bodyParser.urlencoded({
    extended: true, // to support URL-encoded bodies
  })
);

/* Database Connection */
let connection = mysql.createConnection({
  host: "mydbinstance1.xxxx.us-west-2.rds.amazonaws.com",
  port: "3306",
  user: "admin",
  password: "admin123",
  connectTimeout: 2500,
  database: "twitterDB",
});
//Test connection
connection.connect((err) => {
  if (err) {
    console.log("Error connecting to Db", err);
    return;
  }
  console.log("Connection established");
});

let forceStop = false;
/* GET home page. */
router.get("/", function (req, res, next) {
  console.log(req.body);
  res.send("analysis server!");
});
router.post("/", (req, res) => {
  // RECEIVE STREAM POST - Receiving Stream Data Posted via HTTP-Request FROM twitter-server
  if (req.body.tweet && req.body.filter) {
    if (req.body.tweet !== "NULL" && req.body.filter !== "stopSearch") {
      // Do sentiment analysis
      let sentimentScore = sentimentAnalyze(req.body.tweet);
      let trueScore = computeSentimentTrueScore(
        sentimentScore.score,
        req.body.filter,
        forceStop
      );
      try {
        // Save to Database
        addResultsToDB(req.body.filter, req.body.tweet, trueScore);
      } catch (error) {
        console.log("Failed to add results to db...", error);
      }
    } else {
      console.log("force stop is true now... null tweet and stopSearch filter");
      forceStop = true;
    }
  }

  // RECEIVE QUERY  - Receiving Query from user-server
  else if (req.body.sentimentFilter) {
    // get sentiment analysis from db
    retrieveSentimentScoreFromDB(req.body.sentimentFilter, function (results) {
      if (results) {
        // 1) Convert QUERY into JSON, sending array
        let sentimentScore = { score: results[0].sentimentScore };
        console.log("JSON OBJECT", sentimentScore);
        // 2) Send via HTTP post request to the USER-SERVER
        request(
          {
            url: "http://50.112.29.250:3000",
            method: "POST",
            json: true, // <--Very important!!!
            body: sentimentScore,
          },
          function (error, response, body) {
            if (error) {
              console.log(
                "HTTP POST: Sending sentimentScore to user-server Failed...",
                error
              );
            } else {
              console.log("Succesful sent the score to user-server");
            }
          }
        );
      } else {
        console.log("no result recieved from db!");
      }
    });
    res.send("request senti score, okay.");
  }
});

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
    console.log("DB Fail to Add:", error);
  }
}
function sentimentAnalyze(tweet) {
  var sentiment = new Sentiment();
  var result = sentiment.analyze(tweet);
  return result;
}

// This function takes in the array of sentiment scores retrieved from the db based
// on a filter. It executes additonal computation on the data to increase load
function computeSentimentTrueScore(sentimentScores, filter, forceStop) {
  console.log("NOW running computeSentimentTrueScore...");
  rootArray = [1, 2, 3, 4, 5];
  let loopLength = 1000000;
  let rootMeanSquare = 0;
  let value = 0;
  for (var i = 0; i < loopLength; i++) {
    rootMeanSquare = loopLength * sentimentScores + i;
    rootMeanSquare += ss.rootMeanSquare(rootArray);
    value += rootMeanSquare;
  }
  return value;
}

function retrieveSentimentScoreFromDB(filter, callback) {
  //  MySQL INSERT query
  let query = connection.query(
    "SELECT sentimentScore from post_archive WHERE filter = " +
      mysql.escape(filter) +
      " LIMIT 1",
    function (error, results, fields) {
      if (error) {
        console.log("failed to get score from DB", error);
      } else {
        callback(results);
      }
    }
  );
}

module.exports = router;
