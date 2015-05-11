var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var submissionSchema = new Schema({
	studentID	: 	{type: Schema.ObjectId, ref: 'StudentSchema'},
	questionTag : 	String,
	enteredAt 	: 	{type: Date, required: true, default: Date},
	value		: 	String
});

var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;