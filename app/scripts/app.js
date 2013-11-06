/**
 * Application angular qui permet d'afficher la page et de connecter les websockets.
 * 
 * @author ZUBER Lionel <lionel.zuber@armaklan.org>
 * @version 0.1
 * @license MIT
 */

var logApp = angular.module('logApp', ['luegg.directives', 'ngResource']);

logApp.factory('LogsService', ['$resource',
  function($resource){

    return $resource('/logs.json', {}, {
      query: {method:'GET', isArray:'true'}
    });
  }
]);

logApp.factory('socket', function ($rootScope) {
  return {
    giveSocket: function() {
        var disconnecting = false;
        var socket = {};
        return {
          connect: function(logId){
            disconnecting = false;
            socket = io.connect("/" + logId);
          },
          on: function(eventName, callback){
            socket.on(eventName, function(){
              var args = arguments;
              if(!disconnecting){
                $rootScope.$apply(function(){
                  callback.apply(socket, args);
                });
              }
            });
          },
          emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function(){
              var args = arguments;
              $rootScope.$apply(function(){
                if (callback) {
                  callback.apply(socket, args);
                }
              });
            })
          },
          disconnect: function(){
            disconnecting = true;
            socket.disconnect();
          },
          socket: socket
        };
    }
  }
});


logApp.controller('logAppCtrl', function(LogsService, socket, $scope){

    $scope.query = "";
    $scope.msg = [];
    $scope.selectedLog = -1;
    $scope.glued = true;
    $scope.logs = [];

    LogsService.query({}, function(data) {
      $scope.logs = data;
    });

    $scope.sock = null;

    $scope.changeLog = function(log) {
      if ($scope.sock != null) {
        $scope.sock.disconnect();

        $scope.msg = [];
        $scope.logs.forEach(function(log) {
          log.css = '';
        });
      }
      $scope.selectedLog = log.id;
      log.css = 'active';

      $scope.sock = socket.giveSocket();
      $scope.sock.connect($scope.selectedLog);

      $scope.sock.on('Log', function(result) {
        $scope.msg.push(result);
        if($scope.msg.length > 300) {
            $scope.msg.shift();
        }
      });

      $scope.sock.emit('init');

    }

});
