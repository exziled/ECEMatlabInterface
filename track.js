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

var student_data = {};
var student_ip_map = {};

var client_list = [];

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/pages/root.html');
})


app.get('/data/students', function(req, res) {

	sql_conn.query('SELECT users.user_id as user_id, users.student_id as student_id, users.ip_address as ip_addr, CONCAT(map.first_name, " ", map.last_name) as name FROM users LEFT JOIN student_id_map as map on users.student_id = map.student_id ORDER BY map.last_name', function(err, rows, fields) {
		if (err) throw err;

		rows.forEach(function(val, idx, rows) {
			student_data[val.user_id] = val;
			student_ip_map[val.ip_addr] = val.user_id;
		});

		// console.log(student_ip_map);

		res.send(JSON.stringify(student_data));
	});
});

io.on('connection', function (socket) {

	console.log("Client Connected");

	socket.emit('init');


	client_list.push(socket);

	// setInterval(function() {
	// 	console.log("Scanning");

		
			
	// 		// socket.emit('clients', report[0].neighbors);
	// 	});

	// }, 10000);

  // socket.emit('news', { hello: 'world' });

  // socket.on('my other event', function (data) {
  //   console.log(data);
  // });


});


setInterval(function() {
	if(!client_list.length)
	{
		console.log("No Clients, No nmap");
	} else {

		// Fire up nmap looking for clientss
		scanner.nmap('discover', opts, function(err, report) {
			if (err) console.error(err);

			console.log("Scan Complete");

			var ret = []

			// Iterate over returned neighbors and see if they're people we care about
			report[0].neighbors.forEach(function(val, idx, rows) {
				if (student_ip_map[val])
				{
					console.log("Host Found");

					ret.push({'user_id': student_ip_map[val], 'status': 'active'});
				}
			});

			// Send neighbor intersection to clients
			for(var i = 0; i < client_list.length; i++)
			{
				client_list[i].emit('updates:ip', ret);
			}
		});
	
	}
}, 1000);


// var server = app.listen(3000, function() {
// 	var host = server.address().address;
// 	var port = server.address().port;

// 	console.log('Example app listening at http://%s:%s', host, port);
// })
 

