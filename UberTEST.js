var Uber = require('node-uber');
var express = require('express');
var app = express();
const axios = require('axios');

var options = {
	sandbox: true,
	client_id: 'U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO',
	client_secret: 'ZYsY5VD_Ej3XeJpDh6_We09SouLGxNtw3MVpnyt',
	server_token: 'xXuaiNgnK2lmO2YTN2jTsJs61R8ZGXA05m9_rC4f',
	redirect_uri: 'http://localhost:3000/callback',
	language: 'en_US',
	sandbox: true
};

var uber = new Uber(options);
let config = {
	headers: {
		Authorization: 'Token xXuaiNgnK2lmO2YTN2jTsJs61R8ZGXA05m9_rC4f',
		'Accept-Language': 'en_US',
		'Content-Type': 'application/json'
	}
};

app.get('/', function(req, res) {
	// Kick off the authentication process
	var scope = ['request'];
	res.redirect(
		uber.getAuthorizeUrl(scope, 'http://localhost:3000/auth/uber/callback')
	);
});

app.get('/auth/uber/callback', function(req, res) {
	uber.authorization(
		{ grantType: 'authorization_code', authorization_code: req.query.code },
		function(err, access_token) {
			console.log(req.query.code);
			// Now we've got an access token we can use to book rides.
			// Access tokens expires in 30 days at whichpoint you can refresh.
			// You should save this token
			// More info: https://developer.uber.com/docs/authentication
			uber.access_token = access_token;
			res.send('Got token! /book to initiate an ride request.');
		}
	);
});

app.get('/book', function(req, res) {
	var rideDetails = {
		start_latitude: 37.78825,
		start_longitude: -122.4324,
		product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d' // SF Uber X
	};

	uber.requests.requestRide(rideDetails, function(err, result) {
		if (err) {
			// Failed
			console.log(err);
		} else {
			console.log(result, 'RESULT');
			res.json(result);
		}
	});
});

// app.get('/products', async (request, res, next) => {
// 	try {
// 		const { data } = await axios.request(
// 			'https://api.uber.com/v1.2/products?latitude=37.7752315&longitude=-122.418075',
// 			config
// 		);
// 		console.log(data);
// 		res.json(data);
// 	} catch (error) {
// 		console.log(error);
// 	}
// });

// app.get('/products/:id', async (req, res, next) => {
// 	let id = req.params.id;
// 	try {
// 		const { data } = await axios.request(
// 			`https://api.uber.com/v1.2/products/${id}`,
// 			config
// 		);
// 		console.log(data);
// 		res.json(data);
// 	} catch (error) {
// 		console.log(error);
// 	}
// });
// app.get('/estimate/price', async (req, res, next) => {
// 	try {
// 		const { data } = await axios.request(
// 			`https://api.uber.com/v1.2/estimates/price?start_latitude=37.7752315&start_longitude=-122.418075&end_latitude=37.7752415&end_longitude=-122.518075`,
// 			config
// 		);
// 		const comparePrice = (a, b) => {
// 			if (a.high_estimate === null) {
// 				return 1;
// 			}
// 			if (b.high_estimate === null) {
// 				return -1;
// 			}
// 			return (
// 				(a.high_estimate + a.low_estimate) / 2 -
// 				(b.high_estimate + b.low_estimate) / 2
// 			);
// 		};
// 		data.prices.sort(comparePrice);
// 		//VVVVV return lowest single itemVVVVV
// 		// res.json(data.prices[0]);
// 		//VVVV return sorted data VVVVVV
// 		res.json(data);
// 	} catch (error) {
// 		console.log(error);
// 	}
// });

// app.get('/estimate/time', async (req, res, next) => {
// 	try {
// 		const { data } = await axios.request(
// 			'https://api.uber.com/v1.2/estimates/time?start_latitude=37.7752315&start_longitude=-122.418075',
// 			config
// 		);
// 		const compareTime = (a, b) => {
// 			return a.estimate - b.estimate;
// 		};
// 		data.times.sort(compareTime);
// 		//VVVVV return lowest single itemVVVVV
// 		// res.json(data.times[0]);
// 		//VVVV return sorted data VVVVVV
// 		res.json(data);
// 	} catch (error) {
// 		console.log(error);
// 	}
// });

app.listen(3000, function() {
	console.log('Listening on port 3000!');
});

// start lat
// start long
// end lat
// end long
// config*
