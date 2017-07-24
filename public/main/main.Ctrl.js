(function() {
  'use strict';

  angular
    .module('app')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$localStorage', 'socket'];

  function MainCtrl($scope, $localStorage, socket) {

      $scope.users = [];
      $scope.user = $localStorage.user;
      $scope.message = '';
      $scope.messages = [];

      socket.emit('all-users', $scope.user);

      socket.emit('all-messages', {
          room: $scope.user.room
      });

      socket.on('all-messages-received', function (data) {
         // data.forEach(function (message) {
         //     if(message.id === $scope.user.id) {
         //         message.direction = 'left';
         //         message.messageClass = 'message-me';
         //     } else {
         //         message.direction = 'right';
         //         message.messageClass = 'message';
         //     }
         // });
         $scope.messages = data;
         console.log($scope.messages);
      });

      socket.on('all-users', function (data) {
        console.log(data);
        $scope.users = data.filter(function (user) {
           return user.id !== $scope.user.id;
        });
      });

      socket.on('message-received', function (data) {
        // if(data.id === $scope.user.id) {
        //     data.direction = 'left';
        //     data.messageClass = 'message-me';
        // } else {
        //     data.direction = 'right';
        //     data.messageClass = 'message';
        // }
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