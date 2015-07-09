var express = require('express');
var router = express.Router();
var cradle = require('cradle');
var util = require('util');
var marked = require('marked');
var request = require('request');

function notFound(res) {
	res.status(404);
	res.render('404', {title: '404- not found'});
}

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
		
		res.render('index', { title: 'OCDP Device Database', newDevices: nDev });
	});
	
});

router.get('/newDevice', function(req, res, next) {
	
	if(typeof req.query.success != 'undefined') {
		var added;
		if(req.query.success == 'true') added = true;

		else added = false;
		
	}
	
	res.render('add', { title: 'OCDP Device Database', success: added});

});

router.post('/newDevice', function(req, res, next) {
	
	var timestamp = (new Date).getTime();
	devices.save({
		name: req.body.deviceName, type: req.body.type, manufacturer : req.body.manufacturer, website: req.body.website, git: req.body.git, description: req.body.description, dateAdded: timestamp
	}, function (err, dbRes) {
		
		if(err) res.redirect('/newDevice?success=false');
		else res.redirect('/newDevice?success=true');
	});
	
});

router.get('/device', function(req, res, next) {

	if(typeof req.query.name != 'undefined') {
		devices.view('devicelist/single', {key: req.query.name}, function (err, data) {
			if(err) notFound(res);
			else res.render('single', {title: data[0].value.name, device: data[0].value});
		});
	}
	else notFound(res);
	
	
});

router.get('/markdown', function(req, res, next) {
	
	if(typeof req.query.name != 'undefined') {
		devices.view('devicelist/git', {key: req.query.name}, function (err, data) {
			if(err) res.sendStatus(404);
			else if(typeof data[0] != 'undefined') {
				request(data[0].value.url, function(err, response, body) {
					if(err) res.sendStatus(404);
					else marked(body, function(err, content) {
						if(err) res.sendStatus(404);
						else res.send(content);
					});
				});
			}
			else res.sendStatus(404);
		});
	}
	else res.sendStatus(404);
	
});

router.get('/list', function(req, res, next) {
	var page = 0;
	if(typeof req.query.page != 'undefined') page = req.query.page;
	
	devices.view('devicelist/all', function (err, data) {
		var nDev = [];
		for(var i = page; i < page+10; i++) nDev.push(data[i]);
		var total = Math.ceil(data.length/10);
		console.log(nDev);
		res.render('list', { title: 'OCDP Device List', devices: nDev, num: total, cur: page});
	});
	
});

router.get('*', function(req, res){
	notFound(res);
});


module.exports = router;
