var Student = require('../models/student');
var Question = require('../models/question');

module.exports = function(app) {
	app.get('/data/students', function(req, res) {

		// Student.find({}, function (err, students){
		// 	if (err) throw err;

		// 	res.send(JSON.stringify(students));
		// });

		Student.find({})
		.populate('submissions')
		.exec(function (err, students) {
			if (err) throw err;

			res.send(JSON.stringify(students));
		});

	});

	app.get('/data/questions', function(req, res) {

		Question.find({}, function (err, questions){
			if (err) throw err;

			res.send(JSON.stringify(questions));
		});
	});
}