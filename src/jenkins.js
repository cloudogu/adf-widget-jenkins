'use strict';

var jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider'])
  .config(registerWidget);

function registerWidget(dashboardProvider) {
  dashboardProvider
    .widget('jenkins', {
      title: 'jenkins',
      description: 'widget to display statistics from jenkins',
      templateUrl: '{widgetsPath}/jenkins/src/view.html',
      resolve: {
        data: function(jenkinsApi, config) {
          if (config.apiUrl) {
            return jenkinsApi.getData(config.apiUrl);
          }
          return 'Please Setup the Widget';
        }
      },
      controller: 'jenkinsStats',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/edit.html'
      }
    });
}
