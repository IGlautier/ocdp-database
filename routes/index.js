var express = require('express');
var router = express.Router();
var cradle = require('cradle');
var util = require('util');


var con = new(cradle.Connection)('http://localhost', 5984, {
      cache: true,
      raw: false,
      forceSave: true
  });

var devices = con.database('device');

/* GET home page. */
router.get('/', function(req, res, next) {
	devices.view('devicelist/all', function (err, data) {
		var nDev = [];
		for(var i = data.length-1; i > data.length-4; i--) nDev.push(data[i]);
		console.log(util.inspect(nDev));
		res.render('index', { title: 'OCDP Device Database', newDevices: nDev });
	});
	
});

router.get('/newDevice', function(req, res, next) {
	if(req.query.success) var added = true;

	if(req.query.failure) var added = false;

	console.log(req.query);
	res.render('add', { title: 'OCDP Device Database', success: added});

});

router.post('/newDevice', function(req, res, next) {
	
	var timestamp = (new Date).getTime();
	devices.save({
		name: req.body.deviceName, type: req.body.type, manufacturer : req.body.manufacturer, website: req.body.website, git: req.body.git, description: req.body.description, dateAdded: timestamp
	}, function (err, dbRes) {
		console.log(dbRes);
		if(err) res.redirect('/newDevice?failure=true');
		else res.redirect('/newDevice?success=true');
	});
	
});

module.exports = router;
