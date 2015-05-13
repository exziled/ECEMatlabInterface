var csv = require('csv');
var parser = csv.parse;

var Student = require('../models/student');
var Submission = require('../models/submission')
var Question = require('../models/question')

var questionTypes = require('../types.js');

module.exports = function(app) {
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


	app.post('/admin/question/add', function(req, res) {
		console.log(req.body);

		// typeEnum = 

		if (req.body.questionType == "filter"){
			typeEnum = questionTypes.questionTypes.FILTER;
		} else if (req.body.questionType == "analysis") {
			typeEnum = questionTypes.questionTypes.ANALYSIS;
		}

		var newQuestion = Question({
			questionTag 	: 	req.body.questionTag,
			questionType 	: 	typeEnum,
			questionData	: 	req.body.questionData
		});

		var response = {success: null, message: null};

		// On success, return submitted data to angular
		newQuestion.save(function(err, question) {
			if (err) {
				response.success = false;
			} else {
				response.success = true;
				response.message = question;
			}

			res.send(JSON.stringify(response));
		});
	});
}