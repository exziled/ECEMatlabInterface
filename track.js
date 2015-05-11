// var scanner = require('node-libnmap');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var path = require('path');

var csv = require('csv');
var parser = csv.parse;

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
var Submission = require('./app/models/submission')

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
		lastName: 	req.body.lastName,
		isActive: 	false
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

app.post('/admin/roster/add_bulk', function(req, res) {
	var response = {success: null, message: null};

	csv.parse(req.body.bulkData, function(err, output) {

		var newStudents = [];

		output.forEach(function(val, idx, rows) {
			newStudents.push({
				studentID : val[0],
				firstName : val[2],
				lastName  : val[1],
				isActive  : false
			});
		});

		console.log(newStudents)

		Student.create(newStudents, function(err, students) {
			if (err) {
				response.success = false;
			} else {
				response.success = true;
				response.message = students;
			}
			res.send(JSON.stringify(response));
		});
	});
});

app.get('/data/students', function(req, res) {

	Student.find({}, function(err, students){
		if (err) throw err;

		res.send(JSON.stringify(students));
	});
});


// part of student interface
// register in system, generates secret key and saves along with ip address in mongo
// essentially links a real world computer with student already in the roster
// no one else should be able to register after a user has registered
app.post('/student/register', function(req, res) {
	Student.findOne({ 'studentID' : req.body.studentID }, function(err, student) {
		if (err) throw err;

		student.ipAddress = req.connection.remoteAddress;
		student.secretKey = 'abcd';

		var response = {success: null, message: null};

		student.save(function(err, student) {
			if (err) {
				response.success = false;
			} else {
				response.success = true;
				response.message = "Registration Successful"
			}

			res.send(JSON.stringify(response));

			// do a websocket to trigger updates
		});
	});
});


// part of student interface
// submit data for a question answer
app.post('/student/submit', function(req, res) {
	var studentConstraints = {
		'ipAddress' : req.connection.remoteAddress,
		'secretKey' : req.body.secretKey,
	};

	// Find the student described by the submitted ip address and secret key
	Student.findOne(studentConstraints, function(err, student) {
		if (err) throw err;

		// create a new submission for them
		var sub = new Submission({studentID : student._id, questionTag : req.body.questionTag, value : req.body.questionValue});

		sub.save(function(err) {
			if (err) throw err;

			res.send(JSON.stringify(student));
		});		
	});
});


// part of student interface
// retreive data from an earlier submission
// only returns the newest result, even though all are saved
app.post('/student/check', function(req, res) {
	var studentConstraints = {
		'ipAddress' : req.connection.remoteAddress,
		'secretKey' : req.body.secretKey,
	};

	// Find the student described by ip address and secret key
	Student.findOne(studentConstraints, function(err, student) {
		if (err) throw err;

		var sub = Submission.findOne({studentID : student._id, questionTag : req.body.questionTag}, {}, {sort: {'enteredAt' : -1}}, function(err, submission) {
			res.send(JSON.stringify(submission));
		});
	});
});