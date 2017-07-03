'use strict';

angular.module('adf.widget.jenkins')
  .controller('projectViewEditController', function (jenkinsApi, $scope, jenkinsEndpoint) {

    var vm = this;

    vm.updateProjectList = updateProjectList;

    if (jenkinsEndpoint.url) {
      vm.url = jenkinsEndpoint.url;
    }

    updateProjectList(vm.url);

    function updateProjectList(url) {
      var projects = [];
      jenkinsApi.crawlJenkinsJobs(url).then(function (data) {
        data.forEach(function (project) {
          var proj = {
            name: project.name
          };
          projects.push(proj);
        });
      });
      vm.projects = projects;
    }

  });
