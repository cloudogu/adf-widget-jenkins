'use strict';

var jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js'])
  .config(registerWidget);

function registerWidget(dashboardProvider) {
  dashboardProvider
    .widget('jenkins', {
      title: 'Jenkins Project View',
      description: 'Widget to display custom jenkins job',
      templateUrl: '{widgetsPath}/jenkins/src/view.html',
      resolve: {
        data: function(jenkinsApi, config) {
          if (config.apiUrl) {
            return jenkinsApi.getJobData(config.apiUrl,config.project);
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
      title: 'Jenkins Global Statistics',
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
        templateUrl: '{widgetsPath}/jenkins/src/charts/edit.html'
      }
    })
    .widget('lastBuilds', {
      title: 'Get last builds',
      description: 'Widget to diplay the state of last builds',
      templateUrl: '{widgetsPath}/jenkins/src/lastBuilds/view.html',
      resolve: {
        data: function(jenkinsApi, config) {
          if (config.apiUrl) {
            return jenkinsApi.getLastBuilds(config.apiUrl,config.numberOfBuilds);
          }
          return 'Please Setup the Widget';
        }
      },
      controller: 'lastBuildsController',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/lastBuilds/edit.html'
      }
    });
}
