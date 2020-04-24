var express = require("express");
var router = express.Router();

/*
    This router handles are incoming AND outgoing POST requests to the user-server.
*/

router.post("/", (req, res) => {
  // RECEIVE QUERY  - Receiving Query from user-server
  if (req.body.searchTerm) {
    console.log(req.body);

    // Send to The Twitter Stream Server
    // 1) Convert QUERY into JSON
    query = { query: req.body };
    // 2) Send via HTTP post request to the TWITTER-SERVER
    request(
      {
        url: "http://josiahchoi.com/myjson",
        method: "POST",
        json: true, // <--Very important!!!
        body: query,
      },
      function (error, response, body) {
        console.log(
          "HTTP POST: Sending query to twitter-server Failed...",
          error
        );
      }
    );
  } else {
    // RECEIVE Sentiment Request - from user-server
    if (req.body.sentiAnalysis) {
      // Send the analysis data to the user
      // 1) Convert QUERY into JSON
      sentimentScore = { score: "Senitment Score: 9 Billion" };
      // 2) Send via HTTP post request to the TWITTER-SERVER
      request(
        {
          url: "http://josiahchoi.com/myjson",
          method: "POST",
          json: true, // <--Very important!!!
          body: sentimentScore,
        },
        function (error, response, body) {
          console.log(
            "HTTP POST: Sending sentimentScore to user-server Failed...",
            error
          );
        }
      );
    }
  }
});

module.exports = router;
