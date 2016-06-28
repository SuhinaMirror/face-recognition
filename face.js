const fs = require('fs');
const moment = require('moment');
const request = require("request");

const apiURL = 'https://api.projectoxford.ai/face/v1.0/';
const faceKey = process.env.FACEKEY;
const personGroupId = 'suhina';
const requiredConfidence = 0.4;
const showDebug = true;

function debug(message) {
	if (showDebug) {
		console.log(`[${moment().format('HH:mm:ss')}] ${message}`);
	}
}

debug("face.js using FaceAPI key: " + faceKey);

module.exports = {
	debug: (message) => {
		debug(message);
	},
	//Converts an image to a faceID
	detect(imagePath) {
		debug('detect: ' + imagePath);
		return new Promise( (resolve, reject) => {
			const image = fs.readFile(imagePath, null, (error, data) => {
				if (error) throw error;
				const options = {
					method: 'POST',
					url: apiURL + 'detect?returnFaceId=true',
					headers: {
						'ocp-apim-subscription-key': faceKey,
						'content-type': 'application/octet-stream'
					},
					body: data
				};

				debug('\trequesting ' + options.url);
				request(options, function (error, response, body) {
					if (error) throw new Error(error);
					debug('\t' + body);
					const faceData = JSON.parse(body)[0];
					if(faceData) {
						debug('resolve');
						resolve(faceData['faceId']);
					} else {
						debug('reject');
						reject('No face detected.');
					}
				});
			});
			debug('done');
		});
	},
	//Converts a faceID to a personID
	identify(faceID) {
		debug('identify: ' + faceID);
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
				json:true
			};

			debug('\trequesting ' + options.url);
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				debug('\t' + JSON.stringify(body));
				const result = body;
				if(response.statusCode === 200 && result) {
						if(result.length) {
							const candidates = result[0].candidates;
							if(candidates.length) {
								const bestMatch = candidates[0];
								if(bestMatch.confidence > requiredConfidence) {
									debug('resolve');
									resolve(bestMatch.personId);
								} else {
									debug('reject');
									reject('Confidence not high enough');
								};
							} else {
								reject('Candidate not identified');
							};
						} else {
							reject('No candidates found')
						};
				} else {
					reject('Invalid identify request')
				};
			});
			debug('done');
		});
	},
	//Converts a personID to a name
	getName(personID) {
		debug('getName: ' + personID);
		return new Promise( (resolve, reject) => {
			const options = {
				method: 'GET',
				url: apiURL + 'persongroups/' + personGroupId + '/persons',
				headers: {
					'ocp-apim-subscription-key': faceKey,
					'content-type': 'application/json'
				},
				json:true
			};
			debug('\trequesting: ' + options.url);
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				debug('\t' + JSON.stringify(body));
				const result = body;
				if(response.statusCode === 200 && result) {
						if(result.length) {
							const person = result.find( person => person.personId.match(new RegExp(personID, 'i')));
							if(person) {
								debug(JSON.stringify(person));
								resolve(person['name']);
							} else {
								reject('Person name not found.');
							};
						} else {
							reject('Result not found')
						};
				} else {
					reject('Invalid getName request');
				};
				debug('done');
			});
		});
	}
}
