
/* Question Type */

exports.questionTypes = Object.freeze({"FILTER": 1, "ANALYSIS": 2})

exports.isFilter = function(f) {
	return f == questionTypes.FITLER;
}

exports.isAnalysis = function(f) {
	return f == questionTypes.ANALYSIS;
}