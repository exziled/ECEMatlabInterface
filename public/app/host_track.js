var hostTrack = angular.module('hostTrack', []);

// hostTrack.factory('hostTrackData', function($http) {
// 	return {
// 		getData: function() {
// 			return $http.get('/data/students');
// 		}
// 	};
// });

hostTrack.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

hostTrack.controller('hostTrackController', function($scope, $http, socket) {

	$http({
		method: 'get',
		url: '/data/students'
	}).success(function(data, status) {
		$scope.hosts = data;
	}).error(function(data, status) {
		console.log(status);
	});

	socket.on('init', function(data) {
		console.log('not sure');
	});

	socket.on('updates:ip', function(data) {
		for (var key in $scope.hosts) {
			$scope.hosts[key].active = 'inactive';
		}
		// $scope.hosts.forEach(function(val, idx, rows){
		// 	val.active = 'inactive';
		// });

		data.forEach(function(val, idx, rows){
			$scope.hosts[val.user_id].active = val.status;
		});
		
		// $scope.$apply();
		// console.log(data);
	});

	$scope.showDetails = function(host) {
		$scope.selectedHost = host;
	}

	// $http.get('/data/students',function(data) {
	// 	hostTrackControl.hosts = data;
	// })

	// hostTrackControl.hosts = 
	// 	[
	// 		{
	// 			'name': 'Ben Carlson',
	// 			'id': '0755502',
	// 			'ip_addr': '192.168.1.1',
	// 			'active': '1'
	// 		},

	// 		{
	// 			'name': 'Ben Carlson',
	// 			'id': '0755502',
	// 			'ip_addr': '192.168.1.1',
	// 			'active': '1'
	// 		},
	// 	];

	$scope.test = function() {
		console.log("wut");
	}
});