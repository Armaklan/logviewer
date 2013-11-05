/**
 * Created by bennekroufm on 19/10/13.
 */

var pocazApp = angular.module('pocaz', []);

pocazApp.factory('socket', ['$rootScope', function ($rootScope) {

    var socket = io.connect();

    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      disconnect: function () {
        socket.disconnect();
      },
      socket: socket
    };

}]);


pocazApp.controller('pocazCtrl', function(socket, $scope){

    $scope.msg = [];

    socket.on('Log', function(result) {
        $scope.msg.push(result);
        if($scope.msg.length > 100) {
            $scope.msg.shift();
        }
    });

});
