(function() {
    'use strict';

    angular
        .module('app')
        .factory('Auth', Auth);

    Auth.$inject = ['$http'];

    function Auth($http) {

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
            main: function (success, error) {
                $http.get(baseUrl + '/main')
                    .then(success)
                    .catch(error);
            },
            join: function (success, error) {
                $http.get(baseUrl + '/join')
                    .then(success)
                    .catch(error);
            }
        }

    };
})();