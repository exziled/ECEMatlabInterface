var scanner = require('node-libnmap');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var swig = require('swig');
var path = require('path');
var mysql = require('mysql');

server.listen(3000);


var sql_conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'ece486',
  password : 'ece486',
  database : 'ece486'
});

sql_conn.connect();

// Configure view engine as swig and set view path
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Serve static content ourselves to avoid needing a network
app.use(express.static(path.join(__dirname, 'public')));

var opts = {
	range: ['10.0.1.2/24'],
	nmap: '/usr/bin/nmap',
}

app.get('/', function(req, res) {
	res.render('test', { 
		// students: students
    });
})

app.get('/data/table', function(req, res) {

	sql_conn.query('SELECT users.student_id as id, users.ip_address as ip_addr, CONCAT(map.first_name, " ", map.last_name) as name FROM users LEFT JOIN student_id_map as map on users.student_id = map.student_id ORDER BY map.last_name', function(err, rows, fields) {
		if (err) throw err;

		res.render('table', {
			students: rows
		})

		// res.send(JSON.stringify(rows));
	});
});

io.on('connection', function (socket) {

	console.log("Client Connected");

	setInterval(function() {
		console.log("Scanning");

		scanner.nmap('discover', opts, function(err, report) {
			if (err) console.error(err);

			console.log("Scan Complete");
			
			socket.emit('clients', report[0].neighbors);
		});

	}, 10000);

  // socket.emit('news', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });


});


// var server = app.listen(3000, function() {
// 	var host = server.address().address;
// 	var port = server.address().port;

// 	console.log('Example app listening at http://%s:%s', host, port);
// })
 

