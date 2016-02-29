'use strict';

angular.module('adf.widget.adf-widget-jenkins', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('adf-widget-jenkins', {
        title: 'adf-widget-jenkins',
        description: 'adf widgets for preparing statistic data from jenkins server',
        templateUrl: '{widgetsPath}/adf-widget-jenkins/src/view.html',
        edit: {
          templateUrl: '{widgetsPath}/adf-widget-jenkins/src/edit.html'
        }
      });
  });
