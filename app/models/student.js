var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var submissionSchema = new Schema({
	questionID: 	Number,
	questionTag: 	String,
	history: 		[String]
});

var studentSchema = new Schema({
	studentID: 		Number,
	secretKey: 		String,
	ipAddress: 		String,
	firstName: 		String,
	lastName: 		String,
	isActive: 		Boolean,
	submissions: 	[submissionSchema]
})

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;