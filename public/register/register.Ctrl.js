(function () {
    
    angular.module('app')
        .controller('RegisterCtrl', ['$scope', '$localStorage', '$location', 'Auth', RegisterCtrl]);
    
    function RegisterCtrl($scope, $localStorage, $location, Auth) {

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
                $localStorage.token = res.data.token;
                $localStorage.user = res.data.user;
                // localStorage.setItem('token', res.data.token);
                Auth.join(function () {
                    $location.path('/join');
                }, function () {
                    $location.path('/login');
                });
                console.log(res);
            }, function (err) {
                console.log(err);
            });
        };

    }
    
}());