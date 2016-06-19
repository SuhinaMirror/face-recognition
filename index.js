const express = require('express');
const app = express();
const port = process.env.PORT | 3000;

app.get('/', function(req, res){
  res.send('Hello mirror');
});

app.listen(process.env.PORT | 3000);
console.log('Running on ', port);
