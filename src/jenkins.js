'use strict';

angular.module('adf.widget.jenkins', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('jenkins', {
        title: 'jenkins',
        description: 'widget to display statistics from jenkins',
        templateUrl: '{widgetsPath}/jenkins/src/view.html',
        edit: {
          templateUrl: '{widgetsPath}/jenkins/src/edit.html'
        }
      });
  });
