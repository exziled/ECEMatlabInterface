var scanner = require('node-libnmap');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like bellow.
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ECEMatlabInterface');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('Mongo Connection Successful');
});

var Student = require('./app/models/student');

server.listen(3000);


app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Serve static content ourselves to avoid needing a network
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/pages/root.html');
});

app.get('/roster', function(req, res) {
	res.sendFile(__dirname + '/views/pages/roster.html');
});

app.post('/admin/roster/add', function(req, res) {
	
	// Get Data from post
	var newStudent = Student({
		studentID: 	req.body.studentID,
		firstName: 	req.body.firstName,
	});

	var response = {success: null, message: null};

	// On success, return submitted data to angular
	newStudent.save(function(err, student) {
		if (err) {
			response.success = false;
		} else {
			response.success = true;
			response.message = student;
		}

		res.send(JSON.stringify(response));
	});
});

app.get('/data/students', function(req, res) {

	Student.find({}, function(err, students){
		if (err) throw err;

		res.send(JSON.stringify(students));
	});
});


