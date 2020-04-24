// In the user-server Start Stop buttons, I need to have a client-side rule where when the user clicks
// the search button, they must click the stop button first. Then they are allowed to click the start button.
// WHY? Because the twitter-server has a toggle on_stream true/false, first post request starts the search and
// the second post request stops it. So the second post request has to be 'null' ie stopsearch'... and so the third post request 
// restarts the stream

let startBtnClicked = false;
$("#startBtn").prop("disabled", false);
$("#stopBtn").prop("disabled", true);

function toggleBtn(boolean_value) {
    if(startBtnClicked) {
        $("#startBtn").prop("disabled", true);
        $("#stopBtn").prop("disabled", false);    
    } else {
        $("#startBtn").prop("disabled", false);
        $("#stopBtn").prop("disabled", true);              
    }
}
function startSearchForm() {
    startBtnClicked = true;
    toggleBtn(startBtnClicked);

    let form = $("#search-form");
     let query = form.serialize();
    $.post('/', query);
}
function stopSearchForm() {
    startBtnClicked = false;
    toggleBtn(startBtnClicked);
    
    let form = $("#searchStop-form");
    let query = form.serialize();
    console.log(query);
    $.post('/', query);
}
// analyze sentiment button
function analyzeSentiment() {
    // get and post filter to the backend for sentiment score    
    let form = $("#searchSentiment-form");
      let query = form.serialize();
    console.log(query);
    $.post('/', query);
}

// Analysis Chart
//
// get score element
let = resultScore = $('#sentimentScore').val();

let data = [resultScore, resultScore+1];
console.log(resultScore);

var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [0.2, -0.3 , -0.2, 0.1],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
