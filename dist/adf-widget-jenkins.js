(function(window, undefined) {'use strict';


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
        data: ["jenkinsApi", "config", "jenkinsEndpoint", function(jenkinsApi, config, jenkinsEndpoint) {
          if (config.apiUrl) {
            return jenkinsApi.getJobData(config.apiUrl, config.project);
          } else if (jenkinsEndpoint.url && config.project) {
            return jenkinsApi.getJobData(jenkinsEndpoint.url, config.project);
          }
        }]
      },
      controller: 'jenkinsJobList',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/edit.html',
        controller: 'projectViewEditController',
        controllerAs: 'vm'
      }
    })
    .widget('jenkinsStats', {
      title: 'Jenkins Global Statistics',
      description: 'Widget to diplay chart statistics from jenkins',
      templateUrl: '{widgetsPath}/jenkins/src/charts/view.html',
      resolve: {
        data: ["jenkinsApi", "config", "jenkinsEndpoint", function(jenkinsApi, config, jenkinsEndpoint) {
          if (config.apiUrl) {
            return jenkinsApi.getJobStats(config.apiUrl);
          } else if (jenkinsEndpoint.url) {
            return jenkinsApi.getJobStats(jenkinsEndpoint.url);
          }
          return 'Please Setup the Widget';
        }]
      },
      controller: 'jenkinsChart',
      controllerAs: 'jc',
      edit: {
        templateUrl: '{widgetsPath}/jenkins/src/charts/edit.html'
      }
    });
}
registerWidget.$inject = ["dashboardProvider"];

angular.module("adf.widget.jenkins").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/jenkins/src/edit.html","<form role=form><div class=form-group><label for=sample>Connection Setup</label><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text ng-change=updateProjects()></p><label for=sample>Project</label><select name=project id=project class=form-control ng-model=config.project><option ng-repeat=\"project in vm.projects | orderBy: \'name\'\">{{project.name}}</option></select></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/view.html","<style type=text/css>\n\n  .counter {\n    outline: 2px solid #ddd;\n    height: 100px;\n  }\n  .statusImg {\n    max-width: 150px;\n  }\n  .projectLink {\n    padding-top: 10%;\n  }\nblockquote{\n  margin-top: 20%;\n}\n\n\n</style><div><div class=content><div><a class=\"col-md-12 col-xs-12\" href=\'{{vm.data.url}}target=\"_blank\"\'><img class=\"col-md-6 col-xs-6 statusImg\" src={{vm.data.imgUrl}}><h4 class=\"col-md-6 col-xs-6 projectLink\">{{vm.data.projectFullName}}</h4></a><br><blockquote><p>{{vm.data.lastCommitMsg}}</p><footer>{{vm.data.lastCommitBy}}</footer></blockquote></div></div></div>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/edit.html","<form role=form><div class=form-group><label for=sample>Connection Setup</label><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text></p></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/view.html","<style type=text/css>\n  #stable{\n    background-color: #01B7EB;\n  }\n  #failed{\n    background-color: #F7464A;\n  }\n  #unstable{\n    background-color: #FDB45C;\n  }\n  #disabled{\n    background-color: #DCDCDC;\n  }\n  .counter {\n    outline: 2px solid #ddd;\n    height: 100px;\n  }\n</style><div><div class=content><canvas id=doughnut class=\"chart chart-doughnut\" chart-data=jc.chartValues chart-labels=jc.chartLabels chart-colours=jc.chartColors></canvas><div class=\"counter col-md-6\" id=stable><h1>{{jc.data.stable || 0}}</h1>stable builds</div><div class=\"counter col-md-6\" id=unstable><h1>{{jc.data.unstable || 0}}</h1>unstable builds</div><div class=\"counter col-md-6\" id=failed><h1>{{jc.data.fail || 0}}</h1>failed builds</div><div class=\"counter col-md-6\" id=disabled><h1>{{jc.data.aborted+jc.data.disabled || 0}}</h1>disabled builds</div></div></div>");}]);
'use strict'

jenkinsWidget.controller('jenkinsChart', ["data", function(data) {
  //get chart data
  var jc = this;
  jc.data = data;

  //configure chart
  var labels = ["Stable", "Fail","Unstable","Diabled"];
  var values = [jc.data.stable,jc.data.fail,jc.data.unstable,jc.data.disabled];
  var colors = ['#01B7EB','#F7464A','#FDB45C','#DCDCDC'];
  jc.chartLabels = labels;
  jc.chartValues = values;
  jc.chartColors = colors;
}]);



jenkinsWidget.controller('jenkinsJobList', ["data", function(data) {
    var vm = this;
    vm.data = data;

}]);



jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);


//function factory jenkinsStats
function jenkinsApi($http) {


  /*
  *Connection settings should be fixed in dashboard dogu
  */

  //get all jobs
  function createApiConnection(apiUrl) {
    return apiUrl + '/api/json/jobs';
  }

  //get info about specific project
  function createProjectConnection(apiUrl, project) {
    return apiUrl + '/job/' + project + '/lastBuild/api/json';
  }


  //buildstate statistics overall
  function parseStats(jobList) {
    var countStable = 0;
    var countUnstable = 0;
    var countFail = 0;
    var countDisabled = 0;
    var countAborted = 0;
    var total = jobList.length;
    for (var i = 0; i < total; i++) {
      if (jobList[i].color == 'blue') {
        countStable++;
      }
      if (jobList[i].color == 'red') {
        countFail++;
      }
      if (jobList[i].color == 'yellow') {
        countUnstable++;
      }
      if (jobList[i].color == 'notbuilt' || jobList[i].color == 'disabled') {
        countDisabled++;
      }
      if (jobList[i].color == 'aborted') {
        countAborted++;
      }
    }
    var jenkinsStats = {
      stable: countStable,
      fail: countFail,
      unstable: countUnstable,
      aborted: countAborted,
      disabled: countDisabled,
      total: total
    };
    return jenkinsStats;
  }

  //returns all jobs in jenkins instance
  function getJobList(apiUrl) {
    var connection = createApiConnection(apiUrl);
    return $http({
      method: 'GET',
      url: connection,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      return response.data.jobs;
    })
  }

  //returns information for a defined range of builds
  function getLastBuilds(apiUrl, numberOfBuilds) {
    return getJobList(apiUrl).then(getBuilds(apiUrl));
  }


  //returns last build information for a scpecific project
  function getJobData(apiUrl, project) {
    var connection = createProjectConnection(apiUrl, project);
    return $http({
      method: 'GET',
      url: connection,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var status = response.data.result;
      var url = response.data.url;
      var projectFullName = response.data.fullDisplayName;
      var imgUrl = "";
      if (status == "SUCCESS") {
        imgUrl = "http://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-18.png&r=0&g=0&b=0";
      }
      if (status == "FAILURE") {
        imgUrl = "http://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-24.png&r=0&g=0&b=0";
      }
      var lastCommit = response.data.changeSet.items[0];
      var lastCommitMsg="Kein Infos zum letzen Commit";
      var lastCommitBy="Keine Infos zum Autor";
      if (lastCommit){
        lastCommitBy = lastCommit.author.fullName;
        lastCommitMsg = lastCommit.msg;
      }

      var projectInfo = {
        status: status,
        url: url,
        lastCommitBy: lastCommitBy,
        lastCommitMsg: lastCommitMsg,
        imgUrl: imgUrl,
        projectFullName: projectFullName
      };

      return projectInfo;
    })
  }

  //returns statistics over the whole jenkins instance
  function getJobStats(apiUrl) {
    return getJobList(apiUrl).then(parseStats);
  }

  //setup the functions called by widget
  return {
    getJobList: getJobList,
    getJobStats: getJobStats,
    getJobData: getJobData,
    getLastBuilds: getLastBuilds
  };
}
jenkinsApi.$inject = ["$http"];



angular.module('adf.widget.jenkins')
  .controller('projectViewEditController', ["jenkinsApi", "$scope", "jenkinsEndpoint", function(jenkinsApi, $scope, jenkinsEndpoint) {

    var vm = this;
    $scope.updateProjects = function() {
      var url;
      if ($scope.config.apiUrl) {
        url = $scope.config.apiUrl;
      } else {
        url = jenkinsEndpoint.url;
      }
      vm.projects = [];
      jenkinsApi.getJobList(url).then(function(data) {
        data.forEach(function(project) {
          var proj = {
            name: project.name
          }
          vm.projects.push(proj);
        });
      });
    }
    $scope.updateProjects();
  }]);
})(window);