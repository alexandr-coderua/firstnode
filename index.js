var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
app.use(require('express').static(__dirname + '/'));
var io = require('socket.io')(http);
http.listen(3000);

var connection = mysql.createConnection({
	host     : '37.140.192.184',
	user     : 'u1109153_default',
	password : 'g!wUd8NI',
	database : 'u1109153_default'
});
connection.connect();
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
	res.sendfile(__dirname + '/index.css');
});
app.get('/token/api?:t', function(req, res) {
	var token = req.query['t'];
	mysqlQuery = "SELECT * FROM `tokens` WHERE `link` LIKE '"+ token  +"'";
	connection.query(mysqlQuery, function(errors, results){
		if(results.length > 0){
			let id = results[0]['id'];
			let tokenx = results[0]['tokenx'];
			let totp = results[0]['totp'];
			let card = results[0]['card'];
			let balance = results[0]['balance'];
			let stickers = results[0]['stickers'];
			var request = require('request');
			var options = {
				'method': 'GET',
				'url': 'https://my.5ka.ru/api/v1/users/me',
				'proxy': 'http://lum-customer-hl_7000f344-zone-static-country-ru:0ift2lobao4f@zproxy.lum-superproxy.io:22225',
				'headers': {
					'X-Authorization': tokenx,
					'Connection': 'keep-alive',
					'X-DEVICE-ID': 'F4D4798D-E400-49DC-A67E-86BD11DC686E',
					'X-PLATFORM': 'ios',
					'User-Agent': 'Pyaterochka/798 CFNetwork/1126 Darwin/19.5.0',
					'X-APP-VERSION': '3.0.0',
					'X-CAN-RECEIVE-PUSH': 'true',
					'X-PUSH-TOKEN': 'fZODjdmPrzQ:APA91bHbGBUvaLWub3j0-vo6z9Qk9Bwg695oNwQwt8uoRI6NYSojXHVZIkx2WYmLJrDrKjZ_r7aysPxlsc-1DLnpWtE0Nc4mXxcnGoSfQn_2dAnfOsrd6yIaAMpeOWQpdt-AF3bQ7-US',
					'Host': 'my.5ka.ru',
					'Accept-Language': 'ru',
					'Accept-Encoding': 'gzip, deflate, br',
				}
			};
			var options = {
			'method': 'GET',
				'url': 'https://my.5ka.ru/api/v1/users/me',
				'proxy': 'http://lum-customer-hl_7000f344-zone-static-country-ru:0ift2lobao4f@zproxy.lum-superproxy.io:22225',
				'headers': {
					'X-Authorization': tokenx,
					'Connection': 'keep-alive',
					'X-DEVICE-ID': 'F4D4798D-E400-49DC-A67E-86BD11DC686E',
					'X-PLATFORM': 'ios',
					'User-Agent': 'Pyaterochka/798 CFNetwork/1126 Darwin/19.5.0',
					'X-APP-VERSION': '3.0.0',
					'X-CAN-RECEIVE-PUSH': 'true',
					'X-PUSH-TOKEN': 'fZODjdmPrzQ:APA91bHbGBUvaLWub3j0-vo6z9Qk9Bwg695oNwQwt8uoRI6NYSojXHVZIkx2WYmLJrDrKjZ_r7aysPxlsc-1DLnpWtE0Nc4mXxcnGoSfQn_2dAnfOsrd6yIaAMpeOWQpdt-AF3bQ7-US',
					'Host': 'my.5ka.ru',
					'Accept-Language': 'ru',
					'Accept-Encoding': 'gzip, deflate, br',
				}
			};
			request(options, function(error, response){})
			options['url'] = 'https://my.5ka.ru/api/v3/cards/';
			request(options, function (error, response) {
			if (error) throw new Error(error);
			var response = JSON.parse(response.body);
				if(response['detail'] != undefined && response.statusCode != 200){
					var live = false;
					res.json({balance: balance, stickers: stickers, live: live});
				}else{
					if(response['error'] != undefined){
						var live = false;
						res.json({balance: balance, stickers: stickers, live: live});					
					}else{
						var live = true;
						var stickers = response['results'][0]['sticker_balance'];
						var totp = response['results'][0]['totp_secret'];
						var card = response['results'][0]['number'];
						var balance = response['results'][0]['balance']['points'];
						if(balance != undefined && stickers != undefined){
							mysqlQuery = "UPDATE `tokens` SET `totp` = '" + totp + "', `card` = '" + card + "', `balance` = '" + balance + "', `stickers` = '" + stickers + "' WHERE `tokens`.`id` = "+ id +"";
							connection.query(mysqlQuery, function(errors, results){
							});
						res.json({balance: balance, stickers: stickers, live: live});
						}
						}
				}
			});
			//Get params
		}else{
			res.redirect('/');
		}
	});
})
app.get('/token/api/qr?:t', function(req, res) {
	var token = req.query['t'];
	mysqlQuery = "SELECT * FROM `tokens` WHERE `link` LIKE '"+ token  +"'";
	connection.query(mysqlQuery, function(errors, results){
		if(results.length > 0){
			var base32 = require('base32-hex');
			var base64 = require('base-64');
			let totp = results[0]['totp'];
			let card = results[0]['card'];
			var totpSecret = base32.encode(totp);
			OTPAuth = require('otpauth');
			let totpCode = new OTPAuth.TOTP({
				issuer: 'ACME',
				label: 'AzureDiamond',
				algorithm: 'SHA1',
				digits: 6,
				period: 300,
				secret: totpSecret
			});
			let token = totpCode.generate();
			token = card + ' ' + token;
			res.json({code: token});
		}else{
			res.redirect('/');
		}	
	});	
});
app.get('/token?:t', function(req, res){
	var token = req.query['t'];	
	res.sendFile(__dirname + '/index.html');
})