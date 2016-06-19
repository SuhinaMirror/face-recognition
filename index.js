const express = require('express');
const app = express();
const port = process.env.PORT | 3000;
const chokidar = require('chokidar');
const watcher = chokidar.watch('images/');

const faceAPI = require('./face.js');

function identifyPerson(path) {
	console.log(path + ' changed');
	faceAPI.detect(path)
	.then( faceID => {
		console.log('got faceID: ' + faceID);
		faceAPI.identify(faceID)
		.then( personID => {
			console.log('got personID: ' + personID)
			faceAPI.getName(personID)
			.then( name => {
				console.log('got name: ' + name);
				return name;
			})
		})
	});
}

watcher.on('change', path => {
	const name = identifyPerson(path);
});


app.get('/', function(req, res){
	res.send('Hello mirror');
});

app.listen(process.env.PORT | 3000);
console.log('Running on ', port);
