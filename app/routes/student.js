var Student = require('../models/student');
var Submission = require('../models/submission')

module.exports = function(app) {
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
}