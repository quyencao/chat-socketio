'use strict';

angular
  .module('app', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ngStorage',
    'ngLodash'
  ])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/main', {
        templateUrl: 'main/main.html',
        controller: 'MainCtrl'
      })
      .when('/join', {
        templateUrl: 'join/join.html',
        controller: 'JoinCtrl'
      })
      .when('/newroom', {
        templateUrl: 'room/room.html',
        controller: 'RoomCtrl'
      })
      .when('/register', {
        templateUrl: 'register/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/login'
      });

      $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
          return {
              'request': function (config) {
                  config.headers = config.headers || {};
                  if ($localStorage.token) {
                      config.headers.Authorization = 'Bearer ' + $localStorage.token;
                  }
                  return config;
              },
              'responseError': function(response) {
                  if(response.status === 401 || response.status === 403) {
                      $location.path('/');
                  }
                  return $q.reject(response);
              }
          };
      }]);
  });