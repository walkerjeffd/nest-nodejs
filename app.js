var pg = require('pg'),
    async = require('async'),
    request = require('superagent'),
    config = require('./config');
    
var nest = require('nest-thermostat').init(config.nest.username, config.nest.password);
var conString = config.conString;

async.waterfall([
    function connectDb(next) {
      pg.connect(conString, function(err, client, done) {
        if(err) {
          next('error fetching client from pool', err);
        } else {
          next(null, client); 
        }
      });
    },
    function getOutdoor(client, next) {
      request.get('http://api.wunderground.com/api/' + config.wunderground.token + '/conditions/q/ME/Brunswick.json')
        .set('Accept', 'application/json')
        .end(function(res) {
          if (res.body && res.body.current_observation && res.body.current_observation.temp_f) {
            next(null, client, res.body.current_observation.temp_f);  
          } else {
            next('Could not get current outdoor temperature');
          }
        });
    },
    function getIndoor(client, outdoor_temp, next) {
      nest.getInfo(config.nest.serial, function(data) {
        next(null, client, outdoor_temp, data);
      });
    },
    function saveDb(client, outdoor_temp, nest_data, next) {
      client.query('INSERT INTO nest (datetime, temp_outdoor, temp_indoor, temp_target, status) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [new Date(), outdoor_temp, celsiusToFahrenheit(nest_data.current_temperature), celsiusToFahrenheit(nest_data.target_temperature), nest_data],
        function(err, result) {
          if (err) {
            next(err);
          } else {
            next(null, result);
          }
        });
    }
  ], function(err, result) {
    var date = new Date();
    if (err) {
      console.log(date.toISOString() + ' ERROR');
    } else {
      console.log(date.toISOString() + ' SAVED');
      // console.log(result.rows[0]);
    }
    process.exit(0);
});

function celsiusToFahrenheit(temp) {
    return Math.round(temp * (9 / 5.0) + 32.0);
}
