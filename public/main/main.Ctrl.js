(function() {
  'use strict';

  angular
    .module('app')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$localStorage', 'socket', 'lodash'];

  function MainCtrl($scope, $localStorage, socket, lodash) {

      $scope.users = [];
      $scope.user = $localStorage.user;
      $scope.message = '';
      $scope.messages = [];

      socket.emit('all-users', $scope.user);

      socket.emit('all-messages', {
          room: $scope.user.room
      });

      socket.on('all-messages-received', function (data) {
         $scope.messages = data;
      });

      socket.on('all-users', function (data) {
        $scope.users = data.filter(function (user) {
           return user.id !== $scope.user.id;
        });
      });

      socket.on('message-received', function (data) {
        $scope.messages.push(data);
      });

      $scope.sendMessage = function () {
          if($scope.message.trim() === '') {
              return;
          }

          socket.emit('send-message', {
             from: $scope.user.username,
             message: $scope.message,
             room: $scope.user.room
          });

          $scope.message = '';
      };

      $scope.sendMessageEnter = function (event) {
          if(event.keyCode == 13) {
              $scope.sendMessage();
          }
      };

  };
})();