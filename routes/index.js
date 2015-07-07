var express = require('express');
var router = express.Router();
var cradle = require('cradle');

var con = new(cradle.Connection)('http://node:dbp4sS123@localhost', 5984, {
      cache: true,
      raw: false,
      forceSave: true
  });

var devices = con.database('devices');

/* GET home page. */
router.get('/', function(req, res, next) {
	devices.all(function(err, res) {
		if (err) {
			console.log('Error: %s', err)
		} else {
			console.log(res);
		}
	});
	res.render('index', { title: 'Express' });
});

module.exports = router;
