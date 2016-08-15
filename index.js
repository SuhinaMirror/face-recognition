const exec = require('child_process').exec;
const express = require('express');
const faceAPI = require('./face.js');
const port = process.env.PORT | 3000;
const app = express()
	.get('/', (req, res) => {
		res.sendFile(__dirname + '/example.html' )
	})
	.listen(process.env.PORT | 3000, () => faceAPI.debug('Running on ' + port));

const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer({server: app});
//const logic = new WebSocket('ws://192.168.10.40:8080/');

//logic.on('open', () => faceAPI.debug('Connected to logic'));

const spawn = require('child_process').spawn;
const pyshell = spawn('python', [__dirname + '/motion.py']);
pyshell.stdout.on('data', data => {
	faceAPI.debug('motion detected');
	detect()
	.then( name => {
		name = name || null;
		faceAPI.debug('sending ' + name);
		//logic.send(JSON.stringify({
		//	'method':'set',
		//	'key': 'active_user',
		//	'value':name
		//}));
		faceAPI.debug('sending done');
	});
});


function identifyPerson(path) {
	faceAPI.debug(path + ' changed');
	return faceAPI.detect(path)
		.then( faceID => {
			faceAPI.debug('got faceID: ' + faceID);
			return faceAPI.identify(faceID);
		})
		.then( personID => {
			faceAPI.debug('got personID: ' + personID);
			return faceAPI.getName(personID);
		})
		.then( name => {
				faceAPI.debug('got name: ' + name);
					return name;
		})
		.catch( (e) => {
			faceAPI.debug(e);
		});
}

function detect() {
	faceAPI.debug('new image requested');
	return new Promise( (resolve, reject) => {
		exec(__dirname + '/webcam.sh', () => {
			setTimeout( () => {
				identifyPerson('images/current.jpg')
				.then( name => {
					faceAPI.debug('identified: ' + name);
					resolve(name);
				});
			}, 100);
		});
	});
}



wss.on('connection', (ws) => {
	ws.on('message', (data, flags) => {
		switch (data) {
			case 'detect':
				detect()
				.then( name => {
					ws.send(name);
				});
				break;
			case 'hello':
				ws.send('you');
				break;
		}
	});
});
