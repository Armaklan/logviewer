/**
 * Created by bennekroufm on 19/10/13.
 */

var pocazApp = angular.module('pocaz', ['luegg.directives']);

pocazApp.factory('socket', function ($rootScope) {
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
              else {
                callback.apply(socket, args);
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


pocazApp.controller('pocazCtrl', function(socket, $scope){

    $scope.msg = [];
    $scope.selectedLog = 1;
    $scope.glued = true;

    $scope.logs = [];
    $scope.logs[0] = {
      id: 1,
      css: 'active'
    };

    $scope.logs[1] = {
      id: 2,
      css: ''
    };

    $scope.sock = socket.giveSocket();
    $scope.sock.connect($scope.selectedLog);
    $scope.sock.on('Log', function(result) {
        $scope.msg.push(result);
        if($scope.msg.length > 100) {
            $scope.msg.shift();
        }
    });

    $scope.changeLog = function(log) {
      $scope.sock.disconnect();

      $scope.msg = [];
      $scope.logs.forEach(function(log) {
        log.css = '';
      });
      $scope.selectedLog = log.id;
      log.css = 'active';
      
      $scope.sock.disconnect();
      $scope.sock = socket.giveSocket();
      $scope.sock.connect($scope.selectedLog);
      $scope.sock.on('Log', function(result) {
          $scope.msg.push(result);
          if($scope.msg.length > 100) {
              $scope.msg.shift();
          }
      });

    }

});
