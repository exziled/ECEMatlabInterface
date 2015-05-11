/* Web Server Setup */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var swig = require('swig');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure view engine as swig and set view path
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Disable all caching during development
app.set('view cache', false);
swig.setDefaults({ cache: false });

// Serve static content ourselves to avoid needing a network
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


/* Database Setup */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ECEMatlabInterface');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('Mongo Connection Successful');
});


/* Import Routes */
require('./app/routes/pages.js')(app, __dirname);
require('./app/routes/admin.js')(app);
require('./app/routes/student.js')(app);
require('./app/routes/data.js')(app);

// Start Server
server.listen(3000);

