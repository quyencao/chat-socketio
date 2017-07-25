'use strict';

angular
  .module('app', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ngStorage',
    'ngLodash',
    'ngFileUpload'
  ])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/main/:room', {
        templateUrl: 'main/main.html',
        controller: 'MainCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        },
        resolve: {
            user: function (Auth) {
                return Auth.getUser(function (res) {
                    return res.data;
                });
            }
        }
      })
      .when('/join', {
        templateUrl: 'join/join.html',
        controller: 'JoinCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        }
      })
      .when('/newroom', {
        templateUrl: 'room/room.html',
        controller: 'RoomCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        }
      })
      .when('/register', {
        templateUrl: 'register/register.html',
        controller: 'RegisterCtrl',
        restrictions: {
          ensureAuthenticated: false,
          loginRedirect: true
        }
      })
      .when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl',
        restrictions: {
          ensureAuthenticated: false,
          loginRedirect: true
        }
      })
      .otherwise({
        redirectTo: '/login'
      });

      $httpProvider.interceptors.push(['$q', '$location', '$localStorage', 'User', function($q, $location, $localStorage, User) {
          return {
              'request': function (config) {
                  config.headers = config.headers || {};
                  if ($localStorage.token) {
                      config.headers.Authorization = 'Bearer ' + $localStorage.token;
                  }
                  if(User.user.id) {
                      config.headers.id = User.user.id;
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


  })
  .run(routeStart);

    function routeStart($rootScope, $location, $localStorage , $route) {
        $rootScope.$on('$routeChangeStart', (event, next, current) => {
            if (next.restrictions && next.restrictions.ensureAuthenticated) {
                if (!$localStorage.token) {
                    $location.path('/login');
                }
            }
            if (next.restrictions && next.restrictions.loginRedirect) {
                if ($localStorage.token) {
                    $location.path('/join');
                }
            }
        });
    }