var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	studentID: 		Number,
	secretKey: 		String,
	ipAddress: 		String,
	firstName: 		String,
	lastName: 		String,
	isActive: 		Boolean,
	submissions: 	[{type: Schema.ObjectId, ref: 'Submission'}]
})

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;