'use strict';

angular.module('adf.widget.jenkins')
  .controller('projectViewEditController', function(jenkinsApi, $scope, jenkinsEndpoint) {

    var vm = this;
    $scope.updateProjects = function() {
      var url;
      if ($scope.config.apiUrl) {
        url = $scope.config.apiUrl;
      } else {
        url = jenkinsEndpoint.url;
      }
      vm.projects = [];
      jenkinsApi.getJobList(url).then(function(data) {
        data.forEach(function(project) {
          var proj = {
            name: project.name
          }
          vm.projects.push(proj);
        });
      });
    }
    $scope.updateProjects();
  });
