(function () {
    
    angular.module('app')
        .controller('RegisterCtrl', ['$scope', '$localStorage', '$location', 'Auth', 'User', RegisterCtrl]);
    
    function RegisterCtrl($scope, $localStorage, $location, Auth, User) {

        $scope.email = '';
        $scope.username = '';
        $scope.password = '';

        $scope.register = function () {
            var data = {
               email: $scope.email,
               username: $scope.username,
               password: $scope.password
            };

            Auth.register(data, function (res) {
                if(res.data.type === 'OK') {
                    $localStorage.token = res.data.token;
                    User.user = res.data.user;
                    $location.path('/join');
                }
            }, function (err) {
                console.log(err);
            });
        };

    }
    
}());