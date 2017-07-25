(function() {
    'use strict';

    angular
        .module('app')
        .factory('Auth', Auth);

    Auth.$inject = ['$http', '$localStorage'];

    function Auth($http, $localStorage) {

        var baseUrl = 'http://localhost:3000';

        return {
            register: function (data, success, error) {
                $http.post(baseUrl + '/register', data)
                    .then(success)
                    .catch(error);
            },
            login: function (data, success, error) {
                $http.post(baseUrl + '/login', data)
                    .then(success)
                    .catch(error);
            },
            logout: function () {
                delete $localStorage.token;
            }
        }

    };
})();