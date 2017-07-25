(function () {

    angular.module('app')
        .controller('LoginCtrl', ['$scope', '$localStorage', '$location', 'Auth', 'User', LoginCtrl]);

    function LoginCtrl($scope, $localStorage, $location, Auth, User) {

        $scope.email = '';
        $scope.password = '';

        $scope.login = function () {
            var data = {
                email: $scope.email,
                password: $scope.password
            };

            Auth.login(data, function (res) {
                if(res.data.type === 'OK') {
                    $localStorage.token = res.data.token;
                    // $localStorage.user = res.data.user;
                    User.user = res.data.user;
                    // localStorage.setItem('token', res.data.token);
                    // $location.path('/join');
                    Auth.join(function () {
                        $location.path('/join');
                    }, function () {
                        $location.path('/login');
                    });
                }
                console.log(res);
            }, function (err) {
                console.log(err);
            });
        };

    }

}());