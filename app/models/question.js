var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
	questionTag 	: 	String,
	questionType 	: 	Schema.Types.Mixed,
	questionData	: 	String
});

var Question = mongoose.model('Question', questionSchema);

module.exports = Question;