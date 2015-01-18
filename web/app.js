var express = require('express'),
    compression = require('compression'),
    path = require('path'),
    pg = require('pg'),
    config = require('../config');

var conString = config.conString;

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(compression({
  threshold: 512
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/data', function (req, res) {
  var days = +req.query.days || 7;

  pg.connect(conString, function(err, client, done) {
    if(err) {
      res.send(500, "Error connecting to database");
    }
    client.query("select datetime, temp_indoor, temp_outdoor, temp_target, status->>'hvac_heater_state' as heat_on from nest where datetime >= (now() - '" + days + " day'::INTERVAL) order by datetime desc;", function(err, result) {
      //call `done()` to release the client back to the pool
      done();

      if(err) {
        console.log(err);
        res.send(500, "Error querying database");
      } else {
        res.send(result.rows);
      }
    });
  });
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
