(function() {
  'use strict';

  angular
    .module('app')
    .controller('JoinCtrl', JoinCtrl);

  JoinCtrl.$inject = ['$location', '$scope', '$localStorage', 'socket', 'User', 'Auth', 'Upload'];

  function JoinCtrl($location, $scope, $localStorage, socket, User, Auth, Upload) {
      $scope.user = User.user;
      $scope.username = User.user.username;
      $scope.filePath = User.user.image || 'avatar-placeholder.png';
      $scope.id = User.user.id;
      $scope.room = '';
      $scope.rooms = [];

      Auth.getUser(function (res) {
          $scope.user = res.data;
          User.user = res.data;
          $scope.id = User.user.id;
          $scope.username = User.user.username;
          $scope.filePath = User.user.image;
      }, function () {
      });

      socket.emit('all-rooms');

      socket.on('all-rooms-received', function (data) {
         $scope.rooms = data;
         $scope.room = $scope.rooms[$scope.rooms.length - 1];
      });

      $scope.join = function () {
          socket.emit('join', {
             username: $scope.username,
             room: $scope.room,
             image: $scope.user.image
          });
      };

      socket.on('new-user', function (data) {
        User.user = data;
        $location.path('/main/' + data.room);
      });

      $scope.logout = function () {
          Auth.logout();
          $location.path('/login');
      };

      $scope.submit = function() {
          if ($scope.form.file.$valid && $scope.file) {
              $scope.upload($scope.file);
          }
      };

      // upload on file select or drop
      $scope.upload = function (file) {
          Upload.upload({
              url: 'http://localhost:3000/upload',
              data: {file: file}
          }).then(function (res) {
              $scope.filePath = res.data.image;
              User.user.image = res.data.image;
          }, function (resp) {
          }, function (evt) {
          });
      };
  }
})();