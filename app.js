var express = require('express'),
    methodOverride = require('method-override'),
    morgan = require('morgan'), // HTTP request logger middleware
    http = require('http'),
    path = require('path'),
    yaml = require('js-yaml'),
    bodyParser = require('body-parser'),
    pg = require('pg'),
    elasticsearch = require('elasticsearch');
var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
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
var searchClient = new elasticsearch.Client({
  host: '192.168.99.100:9200',
  log: 'trace'
});
var dbUrl = "postgres://postgres:postgres@localhost/worldhistory";

app.get('/api/events', function(request, response) {
  var query = request.query.query;

  searchClient.search({
    q: query,
    sort: 'date',
  }).then(function (body) {
    var hits = body.hits.hits;
    var results = body.hits.hits.map(function(result) {
      return {
        description: result["_source"]["description"],
        date: result["_source"]["date"]
      };
    });

    response.json(results);
  }, function (error) {
    console.trace(error.message);
    response.json({error: "Failed to complete your search query"})
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
