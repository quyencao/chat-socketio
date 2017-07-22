(function() {
    'use strict';

    angular
        .module('app')
        .controller('RoomCtrl', RoomCtrl);

    RoomCtrl.$inject = ['$location', '$scope', 'socket'];

    function RoomCtrl($location, $scope, socket) {

        $scope.room = '';

        $scope.createRoom = function () {
            if($scope.room.trim() !== '') {

                socket.emit('new-room', {
                   room: $scope.room
                });

                $location.url('/join');
            }
        };
    }
})();