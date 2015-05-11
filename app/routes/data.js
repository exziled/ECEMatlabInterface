var Student = require('../models/student');

module.exports = function(app) {
	app.get('/data/students', function(req, res) {

		Student.find({}, function(err, students){
			if (err) throw err;

			res.send(JSON.stringify(students));
		});
	});
}