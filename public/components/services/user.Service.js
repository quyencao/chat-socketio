(function() {
    'use strict';

    angular
        .module('app')
        .factory('User', User);

    function User() {

        var user = {};

        return {

            user: user,
        }

    };
})();