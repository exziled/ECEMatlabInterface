module.exports = function(app, rootPath) {
	app.get('/', function(req, res) {
		res.render('root');
	});

	app.get('/roster', function(req, res) {
		res.render('roster');
	});

	app.get('/questions', function(req, res) {
		res.render('questions');
	});
}