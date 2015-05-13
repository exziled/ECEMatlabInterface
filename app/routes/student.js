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

			if (student == null)
			{
				throw 'nope';
			}

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


		// Find the correct student based on ip address and secret key
		Student.findOne(studentConstraints)
		.populate({
			path: 'submissions',
		})		// return only the tag of each submission
		.exec(function (err, student) {
			if (err) throw(err);

			// Create a new submission
			var sub = new Submission({studentID : student._id, questionTag : req.body.questionTag, value : req.body.questionValue});

			// Save submission and bookkeeping
			sub.save(function(err) {
				if (err) throw err;

				/* hacky workaround to remove referenced documents
				 * that have been populated and add a new document in
				 */
				var new_submissions = []

				// Find matching tags (i.e. the submission we want to replace)
				student.submissions.forEach(function(value, index) {
					if (value.questionTag != req.body.questionTag)
						new_submissions.push(value._id);
				});

				new_submissions.push(sub._id);

				// Replace student array with our new array and save				
				student.submissions = new_submissions;

				student.save(function(err) {
					res.send(JSON.stringify(student));
				});
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