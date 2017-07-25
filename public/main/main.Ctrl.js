(function() {
  'use strict';

  angular
    .module('app')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$localStorage', 'socket', 'Auth', 'User', 'user', '$routeParams'];

  function MainCtrl($scope, $localStorage, socket, Auth, User, user, $routeParams) {
      user.room = $routeParams.room;
      $scope.users = [];
      $scope.user = isEmpty(User.user) ? user : User.user;
      console.log($scope.user);
      $scope.message = '';
      $scope.messages = [];

      socket.emit('all-users', $scope.user);

      socket.emit('all-messages', {
          room: $scope.user.room
      });

      socket.on('all-messages-received', function (data) {
          console.log(data);
         $scope.messages = data;
         $scope.scrollToBottom();
         // console.log($scope.messages);
      });

      socket.on('all-users', function (data) {
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
             room: $scope.user.room,
             image: $scope.user.image
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

      function isEmpty(obj) {

          // null and undefined are "empty"
          if (obj == null) return true;

          // Assume if it has a length property with a non-zero value
          // that that property is correct.
          if (obj.length > 0)    return false;
          if (obj.length === 0)  return true;

          // If it isn't an object at this point
          // it is empty, but it can't be anything *but* empty
          // Is it empty?  Depends on your application.
          if (typeof obj !== "object") return true;

          // Otherwise, does it have any properties of its own?
          // Note that this doesn't handle
          // toString and valueOf enumeration bugs in IE < 9
          for (var key in obj) {
              if (hasOwnProperty.call(obj, key)) return false;
          }

          return true;
      }

  };
})();