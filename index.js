const express = require('express');
const app = express();
const port = process.env.PORT | 3000;
const chokidar = require('chokidar');
const watcher = chokidar.watch('images/');

const faceAPI = require('./face.js');

function identifyPerson(path) {
	faceAPI.debug(path + ' changed');
	return new Promise( (resolve, reject) => {
		faceAPI.detect(path)
		.then( faceID => {
			faceAPI.debug('got faceID: ' + faceID);
			faceAPI.identify(faceID)
			.then( personID => {
				faceAPI.debug('got personID: ' + personID);
				faceAPI.getName(personID)
				.then( name => {
					faceAPI.debug('got name: ' + name);
					resolve(name);
				})
			})
		})
		.catch( (e) => {
			console.log(e);
		});
	});
}

function greet(name) {
	console.log('Hello, ' + name);
}

watcher.on('change', path => {
	setTimeout( () => {
		identifyPerson(path)
		.then( name => {
			faceAPI.debug('identified: ' + name);
			greet(name);
		});
	}, 1000);
});


app.get('/', function(req, res){
	res.send('Hello mirror');
});

app.listen(process.env.PORT | 3000);
faceAPI.debug('Running on ' + port);
