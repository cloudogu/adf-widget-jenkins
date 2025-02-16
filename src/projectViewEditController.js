'use strict';

angular.module('adf.widget.jenkins')
  .controller('projectViewEditController', function (jenkinsApi, $scope, $sce,jenkinsEndpoint) {

    // tooltip for project
    $scope.connectionSetupTooltip = $sce.trustAsHtml('Enter the URL to your Jenkins API server. A valid URL starts with http:// or https://. You can test the widget with the URL https://builds.apache.org/ .');

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
