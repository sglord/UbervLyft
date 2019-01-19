var Uber = require('node-uber');

// create new Uber instance
var uber = new Uber({
	client_id: 'U1SYI1yL12LbnDkZd5T3KVJXLrLKNzMO',
	client_secret: 'ZYsYF5VD_Ej3XeJpDh6_We09SouLGxNtw3MVpnyt',
	server_token: 'xXuaiNgnK2lmO2YTN2jTsJs61R8ZGXA05m9_rC4f',
	redirect_uri: 'http://localhost:3000/callback',
	name: 'stackathonApplord',
	language: 'en_US',
	sandbox: true
});

// get authorization URL
var authURL = uber.getAuthorizeUrl(
	['history', 'profile', 'request', 'places'],
	'http://localhost:3000/callback'
);

// redirect user to the authURL

// the authorizarion_code will be provided via the callback after logging in using the authURL
uber.authorization(
	{
		authorization_code:
			'crd.EA.CAESEBpv4zv5XE1dq7rlN1bIKIAiATE.LoP2EEECnIXQiEvnTMVwaD3VbnL1B78cE4y3StfF-9A#_'
	},
	function(err, res) {
		if (err) {
			console.error(err);
		} else {
			// store the user id and associated properties:
			// access_token = res[0], refresh_token = res[1], scopes = res[2]),and token expiration date = res[3]
			console.log('New access_token retrieved: ' + res[0]);
			console.log('... token allows access to scopes: ' + res[2]);
			console.log('... token is valid until: ' + res[3]);
			console.log(
				'... after token expiration, re-authorize using refresh_token: ' +
					res[1]
			);

			uber.products.getAllForLocation(3.1357169, 101.6881501, function(
				err,
				res
			) {
				if (err) console.error(err);
				else console.log(res);
			});
		}
	}
);
