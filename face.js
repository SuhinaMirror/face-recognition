const request = require("request");
const fs = require('fs');

const apiURL = 'https://api.projectoxford.ai/face/v1.0/';
const faceKey = process.env.FACEKEY;
const personGroupId = 'suhina';

console.log("face.js using FaceAPI key: " + faceKey);

module.exports = {
	detect: (imagePath) => { //.jpg => faceID
		return new Promise( (resolve, reject) => {
			const image = fs.readFileSync(__dirname + '/'+ imagePath);
			const options = {
				method: 'POST',
				url: apiURL + 'detect',
				qs: {
					returnFaceId: 'true',
					returnFaceLandmarks: 'false'
				},
				headers: {
					'ocp-apim-subscription-key': faceKey,
					'content-type': 'application/octet-stream'
				},
				json: false,
				body: image
			};

			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				//TODO: FIX THIS TO RETURN THE RIGHT FACEID
				console.log(response.statusCode);
				console.log(body);
				const tempResult = '2c47869d-47c3-404a-a02e-cc6e88d7d881';
				resolve(tempResult);
			});
		});
	},
	identify: (faceID) => { //faceID => personID
		return new Promise( (resolve, reject) => {
			const options = {
				method: 'POST',
				url: apiURL + 'identify',
				headers: {
					'ocp-apim-subscription-key': faceKey,
					'content-type': 'application/json'
				},
				body: {
							'personGroupId': personGroupId,
							'faceIds':[faceID],
							"maxNumOfCandidatesReturned":1
				},
				json: true
			};

			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				if(response.statusCode === 200 && body) {
						if(body.length) {
							const candidates = body[0].candidates;
							if(candidates.length) {
								const bestMatch = candidates[0];
								if(bestMatch.confidence > 0.75) {
									resolve(bestMatch.personId);
								} else {
									reject('NoIdentify:()');
								};
							};
						};
				};
			});
		});
	},
	getName: (personID) => { //personID => name
		return new Promise( (resolve, reject) => {
			console.log('getName: ' + personID);
			const options = {
				method: 'GET',
				url: apiURL + 'persongroups/' + personGroupId + '/persons',
				headers: {
					'ocp-apim-subscription-key': faceKey,
					'content-type': 'application/json'
				},
				json: true
			};

			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				if(response.statusCode === 200 && body) {
						if(body.length) {
							const result = body.find( person => person.personId.match(new RegExp(personID, 'i')));
							if(result) {
								resolve(result.name);
							} else {
								reject('NoName:(');
							};
						};
				};
			});
		});
	}
}
