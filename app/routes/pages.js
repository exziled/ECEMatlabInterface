module.exports = function(app, rootPath) {
	app.get('/', function(req, res) {
		res.sendFile(rootPath + '/views/pages/root.html');
	});

	app.get('/roster', function(req, res) {
		res.sendFile(rootPath + '/views/pages/roster.html');
	});
}