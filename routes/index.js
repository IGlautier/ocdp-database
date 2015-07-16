var express = require('express');
var router = express.Router();
var cradle = require('cradle');
var util = require('util');
var marked = require('marked');
var request = require('request');
var config = require('./config.json');

function notFound(res) {
	res.status(404);
	res.render('404', {title: '404- not found'});
}

/* GET home page. */
router.get('/', function(req, res, next) {	
	request(config.restApi + 'device/last/3', function (error, response, body) {
		var data = JSON.parse(body);
		if(error) notFound(res);
		res.render('index', { title: 'OCDP Device Database', newDevices: data.devices });
	});
});

/* Get single device */
router.get('/device', function(req, res, next) {

	request(config.restApi + 'device/name/' + req.query.name, function (error, response, body) {
		
	
		if(error) notFound(res);
		var data = JSON.parse(body);
		res.render('single', { title: 'OCDP Device Database', device: data });
	});
});

router.get('/list/type', function(req, res, next) {
	var page = 0;
	request(config.restApi + 'device/type/' + req.query.type, function (error, response, body) {
	
		if(error) res.render('error', {message: '500 - Something went wrong'});
		else {
			var nDev = [];
			var data = JSON.parse(body);
			var i = page*3;
			while(i < (page*3)+3 && i < data.devices.length){
				nDev.push(data.devices[i]);
				i++;
			}
			var total = Math.ceil(data.number/3);
			
			res.render('list', { title: 'OCDP Device List', devices: nDev, num: total, cur: page});
		}
	});
});

router.get('/markdown', function(req, res, next) {

	request(req.query.git, function(err, response, body) {
		if(err) res.sendStatus(404);
		else marked(body, function(err, content) {
			if(err) res.sendStatus(404);
			else res.send(content);
		});
	});
	
});

router.get('/list', function(req, res, next) {
	var page = 0;
	if(typeof req.query.page != 'undefined') page = parseFloat(req.query.page);
	request(config.restApi + 'device/all', function(error, response, body) {
		if(error) res.render('error', {message: '500 - Something went wrong'});
		else {
			var nDev = [];
			var data = JSON.parse(body);
			var i = page*3;
			while(i < (page*3)+3 && i < data.devices.length){
				nDev.push(data.devices[i]);
				i++;
			}
			var total = Math.ceil(data.number/3);
			
			res.render('list', { title: 'OCDP Device List', devices: nDev, num: total, cur: page});
		}
	});
	
});

/* Adding a device */
/*router.get('/newDevice', function(req, res, next) {
	
	if(typeof req.query.success != 'undefined') {
		var added;
		if(req.query.success == 'true') added = true;

		else added = false;
		
	}
	
	res.render('add', { title: 'OCDP Device Database', success: added});

});*/

/* Put new device */
/*router.post('/newDevice', function(req, res, next) {
	
	var filePath = req.files.img.path.slice(6);
	var timestamp = (new Date).getTime();
	devices.save({
		name: req.body.deviceName, type: req.body.type, manufacturer : req.body.manufacturer, website: req.body.website, git: req.body.git, description: req.body.description, dateAdded: timestamp, image: filePath
	}, function (err, dbRes) {
		
		if(err) res.redirect('/newDevice?success=false');

		else res.redirect('/newDevice?success=true');

	});
	
});

*/
router.get('*', function(req, res){
	notFound(res);
});


module.exports = router;
