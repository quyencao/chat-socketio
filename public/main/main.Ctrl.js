(function() {
  'use strict';

  angular
    .module('app')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$localStorage', 'socket', 'Auth', 'User'];

  function MainCtrl($scope, $localStorage, socket, Auth, User) {

      $scope.users = [];
      $scope.user = User.user;
      $scope.message = '';
      $scope.messages = [];

      socket.emit('all-users', $scope.user);

      socket.emit('all-messages', {
          room: $scope.user.room
      });

      socket.on('all-messages-received', function (data) {
         $scope.messages = data;
         $scope.scrollToBottom();
         // console.log($scope.messages);
      });

      socket.on('all-users', function (data) {
        console.log(data);
        $scope.users = data.filter(function (user) {
           return user.id !== $scope.user.id;
        });
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

      $scope.scrollToBottom = function() {
          $('#chat-discussion').animate({ scrollTop: $('#chat-discussion').prop('scrollHeight')}, 500);
      };

  };
})();