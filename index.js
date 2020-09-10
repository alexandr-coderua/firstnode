var app = require('express')();
var http = require('http').createServer(app);
var mysql = require('mysql');
app.use(require('express').static(__dirname + '/'));
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
app.get('/404', function(req, res){
	res.sendFile(__dirname + '/404.html');
});
//Функция Рандом Строки
function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
//Фукнция рандом числа
function randomInteger(min, max) {
	// получить случайное число от (min-0.5) до (max+0.5)
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}
app.get('/token/api?:t', function(req, res) {
	var token = req.query['t'];
	mysqlQuery = "SELECT * FROM `tokens` WHERE `link` LIKE '"+ token  +"'";
	connection.query(mysqlQuery, function(errors, results){
		setTimeout(getParams, 10000);
		function getParams(){
			if(results.length > 0){
				let id = results[0]['id'];
				let tokenx = results[0]['tokenx'];
				let totp = results[0]['totp'];
				let card = results[0]['card'];
				let balance = results[0]['balance'];
				let id_card = results[0]['id'];
				let stickers = results[0]['stickers'];
				let proxy = [
				'37.1.221.45:16790',
				'37.1.221.45:16789',
				'37.1.221.45:16788',
				'37.1.221.45:16787',
				'37.1.221.45:16786',
				'37.1.221.45:16785',
				'37.1.221.45:16784',
				'37.1.221.45:16779',
				'37.1.221.45:16783'];
				let proxy_id = randomInteger(0, 6);
				let device_id = makeid(8)+'-'+ makeid(4) +'-'+ makeid(4) +'-'+ makeid(4)+ '-'+ makeid(12);
				var request = require('request');
				var options = {
					'method': 'GET',
					'url': 'https://my.5ka.ru/api/v1/users/me',
					//'proxy': 'http://lum-customer-hl_7000f344-zone-static-country-ru:0ift2lobao4f@zproxy.lum-superproxy.io:22225',
					'proxy': 'http://sms-activate:508af3dd@'+proxy[proxy_id],
					'headers': {
						'X-Authorization': tokenx,
						'Connection': 'keep-alive',
						'X-DEVICE-ID': device_id,
						'X-PLATFORM': 'ios',
						'User-Agent': 'Pyaterochka/798 CFNetwork/1126 Darwin/19.5.0',
						'X-APP-VERSION': '3.0.0',
						'X-CAN-RECEIVE-PUSH': 'false',
						'Host': 'my.5ka.ru',
						'Accept-Language': 'ru',
						'Accept-Encoding': 'gzip, deflate, br',
					}
				};
				options['url'] = 'https://my.5ka.ru/api/v1/startup/handshake';
				request(options, function(error, response){});
				//options['url'] = 'https://my.5ka.ru/api/v2/kids/';
				//request(options, function(error, response){});
				options['url'] = 'https://my.5ka.ru/api/v1/users/me';
				request(options, function(error, response){});
				//options['url'] = 'https://my.5ka.ru/api/guests/v2/exists/';
				//request(options, function(error, response){});
				options['url'] = 'https://my.5ka.ru/api/v3/cards/';
				request(options, function (error, response) {
				if(error != null){
					getParams();
					return;
				}
				if(response != undefined){
					if(response.statusCode == 200){
						if(response.body.includes('Rejected') == false){
							var response = JSON.parse(response.body);
						}else{
							getParams();
							return;
						}
						if(response['error'] != undefined || response['results'] == undefined){
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
					}else{
						res.json({balance: balance, stickers: stickers, live: live});				
					}
				}else{
					res.json({balance: balance, stickers: stickers, live: live});				
				}
				});
				//Get params
				//options['url'] = 'https://my.5ka.ru/api/v4/promotions/';
				//request(options, function(error, response){});
				//options['url'] = 'https://my.5ka.ru/api/v4/transactions/?card='+ id_card +'&limit=20&offset=0';
				//request(options, function(error, response){});
			}else{
				res.redirect('/');
			}
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