var Uber = require('node-uber');
var express = require('express');
var app = express();
const axios = require('axios');

const passport = require('passport');
const uberStrategy = require('passport-uber-v2').Strategy;

var options = {
	sandbox: true,
	clientId: 'U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO',
	// clientID: 'U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO',
	client_secret: 'ZYsY5VD_Ej3XeJpDh6_We09SouLGxNtw3MVpnyt',
	server_token: 'xXuaiNgnK2lmO2YTN2jTsJs61R8ZGXA05m9_rC4f',
	redirect_uri: 'http://localhost:3000/callback',
	language: 'en_US'
};

// passport.use(
// 	new uberStrategy(
// 		{
// 			clientID: 'U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO',
// 			clientSecret: 'ZYsYF5VD_Ej3XeJpDh6_We09SouLGxNtw3MVpnyt',
// 			callbackURL: 'http://localhost:3000/callback',
// 			redirect_uri: 'http://localhost:3000/callback',
// 			scope: ['request', 'offline_access']
// 		},
// 		// options,
// 		function(accessToken, refreshToken, profile, done) {
// 			var user = profile;
// 			user.accessToken = accessToken;
// 			console.log(accessToken);
// 			return done(null, user);
// 		}
// 	)
// );

// app.get('/auth/uber', passport.authenticate('uber', { scope: ['profile'] }));

// app.get(
// 	'/callback',
// 	passport.authenticate('uber', { failureRedirect: '/' }),
// 	function(req, res) {
// 		res.redirect('/');
// 	}
// );

let config = {
	headers: {
		Authorization: 'Token xXuaiNgnK2lmO2YTN2jTsJs61R8ZGXA05m9_rC4f',
		'Accept-Language': 'en_US',
		'Content-Type': 'application/json'
	}
};

// app.use('/', (req, res, next) => {
// 	res.json('no bueno');
// });

var uber = new Uber(options);

app.get('/', function(req, res) {
	// Kick off the authentication process
	var scope = ['request'];
	res.redirect(uber.getAuthorizeUrl(scope, 'http://localhost:3000/callback'));
});

app.get('/callback', function(req, res) {
	uber.authorization(
		{ grantType: 'authorization_code', authorization_code: req.query.code },
		function(err, access_token) {
			console.log(req.query.code, 'CODEEEEE');
			// Now we've got an access token we can use to book rides.
			// Access tokens expires in 30 days at whichpoint you can refresh.
			// You should save this token
			// More info: https://developer.uber.com/docs/authentication
			uber.access_token = access_token;

			res.send(access_token);
		}
	);
});

// app.get('/book', function(req, res) {
// 	var rideDetails = {
// 		start_latitude: 37.78825,
// 		start_longitude: -122.4324,
// 		product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d' // SF Uber X
// 	};

// 	uber.requests.requestRide(rideDetails, function(err, result) {
// 		if (err) {
// 			// Failed
// 			console.log(err);
// 		} else {
// 			console.log(result, 'RESULT');
// 			res.json(result);
// 		}
// 	});
// });

const personalAccessToken =
	'JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAG8AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAkAAAABwAAAAEAAAAEAAAAGj4xqbkk-4AD2os4xuXzMxsAAAAEBHobFQqzG9e-zFF66JEgX2k5cQGCYOg9sfSJVTpDBxSiyrSFA6rXFWmb99kNWrPWD15IxhOnV4FpPjGUnUdnb8YNtlwGQhMDRzBnEBD-_lyR20-7b_dA7GmTYaAzZnVXuW9EAgt_-MkwbjoDAAAACKPUE49zkPUWUIXeCQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU';

// GET ALL PRODUCTS FOR CURRENT LOCATION
app.get('/products', async (req, res, next) => {
	const configReq = {
		...config,
		Authorization: `Bearer ${personalAccessToken}`
	};
	try {
		const { data } = await axios.request(
			`https://sandbox-api.uber.com/v1.2/products?latitude=37.7752315&longitude=-122.418075`,
			configReq
		);
		console.log(data);
		res.json(data);
	} catch (error) {
		console.log(error);
	}
});

app.get('/', async (req, res, next) => {
	const { data } = await axios.get(
		'https://login.uber.com/oauth/v2/authorize?client_id=U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO&response_type=code&redirect_uri=http://localhost:3000/callback'
	);
	console.log(data);
});

// GET SPECIFIC PRODUCT FOR CURRENT LOCATION
app.get('/products/:id', async (req, res, next) => {
	let id = req.params.id;
	const configReq = {
		...config,
		Authorization: `Bearer ${personalAccessToken}`
	};
	try {
		const { data } = await axios.request(
			`https://sandbox-api.uber.com/v1.2/products/${id}`,
			configReq
		);
		console.log(data);
		res.json(data);
	} catch (error) {
		console.log(error);
	}
});
// GET PRICE ESTIMATES FOR ALL TYPES
app.get('/estimate/price', async (req, res, next) => {
	try {
		const { data } = await axios.request(
			`https://sandbox-api.uber.com/v1.2/estimates/price?start_latitude=37.7752315&start_longitude=-122.418075&end_latitude=37.7752415&end_longitude=-122.518075`,
			config
		);
		const comparePrice = (a, b) => {
			if (a.high_estimate === null) {
				return 1;
			}
			if (b.high_estimate === null) {
				return -1;
			}
			return (
				(a.high_estimate + a.low_estimate) / 2 -
				(b.high_estimate + b.low_estimate) / 2
			);
		};
		data.prices.sort(comparePrice);
		//VVVVV return lowest single itemVVVVV
		// res.json(data.prices[0]);
		//VVVV return sorted data VVVVVV
		res.json(data);
	} catch (error) {
		console.log(error);
	}
});
// GET TIME ESTIMATES FOR ALL TYPES
app.get('/estimate/time', async (req, res, next) => {
	try {
		const { data } = await axios.request(
			'https://sandbox-api.uber.com/v1.2/estimates/time?start_latitude=37.7752315&start_longitude=-122.418075',
			config
		);
		const compareTime = (a, b) => {
			return a.estimate - b.estimate;
		};
		data.times.sort(compareTime);
		//VVVVV return lowest single itemVVVVV
		// res.json(data.times[0]);
		//VVVV return sorted data VVVVVV
		res.json(data);
	} catch (error) {
		console.log(error);
	}
});

// REQUEST A NEW CAR
app.post('/requests/estimate', async (req, res, next) => {
	console.log(req, 'REQEEEEEEESTQQQQRTTT');
	const configReq = {
		...config,
		method: 'post'
	};
	var rideDetails = {
		start_latitude: 37.78825,
		start_longitude: -122.4324,
		product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d',
		end_latitude: 37.7899886,
		end_longitude: -122.4021253,
		seat_count: '2'
	};

	try {
		const { data } = await axios.request(
			'https://sandbox-api.uber.com/v1.2/requests/estimate',
			rideDetails,
			configReq
		);
		console.log(data, 'data');
		res.json(data);
		w;
	} catch (error) {
		console.log(error);
	}
});

// REQUEST A NEW CAR
app.post('/requests', async (req, res, next) => {
	// console.log('req', user);
	const configReq = {
		...config,
		Authorization: `Bearer ${personalAccessToken}`
	};
	var rideDetails = {
		fare_id: 'd30e732b8bba22c9cdc10513ee86380087cb4a6f89e37ad21ba2a39f3a1ba960',
		start_latitude: 37.78825,
		start_longitude: -122.4324,
		end_latitude: 37.7899886,
		end_longitude: -122.4021253,
		product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d' // SF Uber X
	};

	try {
		const { data } = await axios.request(
			'https://sandbox-api.uber.com/v1.2/products?latitude=37.7752315&longitude=-122.418075',
			rideDetails,
			configReq
		);
		console.log(data);
		res.json(data);
	} catch (error) {
		console.log(error);
	}
});

// ///////////////////////////////

app.listen(3000, function() {
	console.log('Listening on port 3000!');
});

// start lat
// start long
// end lat
// end long
// config*
