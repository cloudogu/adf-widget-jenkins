'use strict';

angular.module('adf.widget.jenkins')
  .controller('projectViewEditController', function (jenkinsApi, $scope, $sce,jenkinsEndpoint) {

    // tooltip for project
    $scope.connectionSetupTooltip = $sce.trustAsHtml('A valid URL to your Jenkins server must be stored here. You can use the URL <a href="https://builds.apache.org/">https://builds.apache.org/</a> for testing');

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
