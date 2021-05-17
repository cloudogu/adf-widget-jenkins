'use strict';

function registerWidget(dashboardProvider) {
  const category = 'Jenkins';

  dashboardProvider
    .widget('jenkinsBuildReport', {
      title: 'Jenkins Build Report',
      description: 'Displays current build information',
      category: category,
      templateUrl: '{widgetsPath}/jenkins/src/view.html',
      resolve: {
        data: function(jenkinsApi, config, jenkinsEndpoint) {
          if (config.apiUrl) {
            return jenkinsApi.getJobData(config.apiUrl, config.project);
          } else if (jenkinsEndpoint.url && config.project) {
            return jenkinsApi.getJobData(jenkinsEndpoint.url, config.project);
          }
        }
      },
      controller: 'jenkinsJobList',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/edit.html',
        controller: 'projectViewEditController',
        controllerAs: 'vm'
      }
    })
    .widget('jenkinsGlobalStatistics', {
      title: 'Jenkins Global Statistics',
      description: 'Displays all build jobs as pie chart',
      category: category,
      templateUrl: '{widgetsPath}/jenkins/src/charts/view.html',
      resolve: {
        data: function(jenkinsApi, config, jenkinsEndpoint) {
          if (config.apiUrl) {
            return jenkinsApi.getJobStats(config.apiUrl);
          } else if (jenkinsEndpoint.url) {
            return jenkinsApi.getJobStats(jenkinsEndpoint.url);
          }
          return 'Please Setup the Widget';
        }
      },
      controller: 'jenkinsChart',
      controllerAs: 'jc',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/charts/edit.html',
        controller: 'projectViewEditController',
        controllerAs: 'vm'
      }
    });
}

const jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js', 'ui.bootstrap'])
  .constant("jenkinsEndpoint", {
    "url": "https://builds.apache.org/"
  })
  .config(registerWidget);
