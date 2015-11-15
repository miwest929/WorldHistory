var express = require('express'),
    methodOverride = require('method-override'),
    morgan = require('morgan'), // HTTP request logger middleware
    http = require('http'),
    path = require('path'),
    yaml = require('js-yaml'),
    bodyParser = require('body-parser'),
    pg = require('pg');

var app = module.exports = express();


app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  // Add development specific logic here.
}
else if (env === 'production') {
  // Add production specific logic here.
}

// JSON API
var dbUrl = "postgres://postgres:postgres@localhost/worldhistory";
app.get('/api/timeline', function(request, response) {
  var startTime = request.query.start;
  var endTime = request.query.end;

  pg.connect(dbUrl, function(err, client) {
    client.query("SELECT * FROM timelines WHERE event_date BETWEEN '" + startTime + "' AND '" + endTime + "'", function(err, result) {
      console.log(result.rows)
      response.json(result.rows);
    });
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
