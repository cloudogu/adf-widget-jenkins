'use strict';

var jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js'])
  .config(registerWidget);

function registerWidget(dashboardProvider) {
  dashboardProvider
    .widget('jenkins', {
      title: 'Jenkins BuildJob View',
      description: 'Widget to display custom jenkins jobs',
      templateUrl: '{widgetsPath}/jenkins/src/view.html',
      resolve: {
        data: function(jenkinsApi, config) {
          if (config.apiUrl) {
            return jenkinsApi.getJobData(config.apiUrl);
          }
          return 'Please Setup the Widget';
        }
      },
      controller: 'jenkinsJobList',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/edit.html'
      }
    })
    .widget('jenkinsStats', {
      title: 'Jenkins Statistics',
      description: 'Widget to diplay chart statistics from jenkins',
      templateUrl: '{widgetsPath}/jenkins/src/charts/view.html',
      resolve: {
        data: function(jenkinsApi, config) {
          if (config.apiUrl) {
            return jenkinsApi.getJobStats(config.apiUrl);
          }
          return 'Please Setup the Widget';
        }
      },
      controller: 'jenkinsChart',
      controllerAs: 'jc',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/edit.html'
      }
    });
}
