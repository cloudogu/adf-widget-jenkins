'use strict';

var jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js'])
  .constant("jenkinsEndpoint", {
    "url": "http://builds.apache.org"
  })
  .config(registerWidget);

function registerWidget(dashboardProvider) {
  dashboardProvider
    .widget('jenkins', {
      title: 'Jenkins Project View',
      description: 'Widget to display custom jenkins job',
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
        templateUrl: '{widgetsPath}/jenkins/src/edit.html'
      }
    })
    .widget('jenkinsStats', {
      title: 'Jenkins Global Statistics',
      description: 'Widget to diplay chart statistics from jenkins',
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
        templateUrl: '{widgetsPath}/jenkins/src/charts/edit.html'
      }
    });
}
