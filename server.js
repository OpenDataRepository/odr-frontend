var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/www'));

// Redirect all traffic to the index
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/www/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
