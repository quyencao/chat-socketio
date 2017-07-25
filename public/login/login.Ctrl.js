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
                    User.user = res.data.user;
                    $location.path('/join');
                }
            }, function (err) {
                console.log(err);
            });
        };

    }

}());