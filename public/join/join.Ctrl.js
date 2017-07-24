(function() {
  'use strict';

  angular
    .module('app')
    .controller('JoinCtrl', JoinCtrl);

  JoinCtrl.$inject = ['$location', '$scope', '$localStorage', 'socket'];

  function JoinCtrl($location, $scope, $localStorage, socket) {
      $scope.username = $localStorage.user.username;
      $scope.password = '';
      $scope.room = '';
      $scope.rooms = [];

      socket.emit('all-rooms');

      socket.on('all-rooms-received', function (data) {
         $scope.rooms = data;
         $scope.room = $scope.rooms[$scope.rooms.length - 1];
      });

      $scope.join = function () {
          socket.emit('join', {
             username: $scope.username,
             room: $scope.room
          });
      };

      socket.on('new-user', function (data) {
        $localStorage.user = data;
        // console.log('HREREEEE');
        // console.log(data);
        $location.path('/main');
      });
  }
})();