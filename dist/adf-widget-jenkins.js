(function(window, undefined) {'use strict';


var jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js', 'ui.bootstrap'])
  .constant("jenkinsEndpoint", {
    "url": "http://builds.apache.org"
  })
  .config(registerWidget);

function registerWidget(dashboardProvider) {
  var category = 'Jenkins';

  dashboardProvider
    .widget('jenkinsBuildReport', {
      title: 'Jenkins Build Report',
      description: 'Displays current build information',
      category: category,
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
    .widget('jenkinsGlobalStatistics', {
      title: 'Jenkins Global Statistics',
      description: 'Displays all build jobs as pie chart',
      category: category,
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

angular.module("adf.widget.jenkins").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/jenkins/src/edit.html","<form role=form><div class=form-group><label>Connection Setup</label><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text ng-change=updateProjects()></p><label>Project</label> <input type=text ng-model=config.project uib-typeahead=\"project.name for project in vm.projects | filter:$viewValue | limitTo:10\" class=form-control></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/view.html","<style type=text/css>\n\n  .statusImg {\n    max-width: 125px;\n  }\n\n</style><div><div class=content><div ng-if=vm.data><div class=\"col-md-6 col-xs-6\"><a href=\'{{vm.data.url}}target=\"_blank\"\'><h4>{{vm.data.projectFullName}}</h4></a><p><b>Last Commit:</b> {{vm.data.lastCommitMsg}}</p><footer><b>Author:</b> {{vm.data.lastCommitBy}}</footer></div><div class=\"col-md-6 col-xs-6 pull-right\"><img class=\"statusImg pull-right\" src={{vm.data.imgUrl}}></div></div></div></div>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/edit.html","<form role=form><div class=form-group><label for=sample>Connection Setup</label><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text></p></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/view.html","<style type=text/css>\n  #stable{\n    background-color: #009587;\n  }\n  #failed{\n    background-color: #F34235;\n  }\n  #unstable{\n    background-color: #FEC006;\n  }\n  #disabled{\n    background-color: #DCDCDC;\n  }\n  .counter {\n    outline: 2px solid #ddd;\n    height: 100px;\n  }\n</style><div><div class=content><canvas id=doughnut class=\"chart chart-doughnut\" chart-data=jc.chartValues chart-labels=jc.chartLabels chart-colours=jc.chartColors></canvas><div class=\"counter col-md-6\" id=stable><h1>{{jc.data.stable || 0}}</h1>stable builds</div><div class=\"counter col-md-6\" id=unstable><h1>{{jc.data.unstable || 0}}</h1>unstable builds</div><div class=\"counter col-md-6\" id=failed><h1>{{jc.data.fail || 0}}</h1>failed builds</div><div class=\"counter col-md-6\" id=disabled><h1>{{jc.data.aborted+jc.data.disabled || 0}}</h1>disabled builds</div></div></div>");}]);
'use strict'

jenkinsWidget.controller('jenkinsChart', ["data", function(data) {
  //get chart data
  var jc = this;
  jc.data = data;

  //configure chart
  var labels = ["Stable", "Fail","Unstable","Diabled"];
  var values = [jc.data.stable,jc.data.fail,jc.data.unstable,jc.data.disabled];
  var colors = ['#009587','#F34235','#FEC006','#DCDCDC'];
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

  const imgURLBuildSuccess = 'src/img/successful.png';
  const imgURLBuildFailed = 'src/img/failed.png';
  const imgURLBuildUnstable = 'src/img/unstable.png';
  const defaultMsgNoAuthor = 'No author found';
  const defaultMsgNoCommitInfo = 'No commit information found';


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
    return {
      stable: countStable,
      fail: countFail,
      unstable: countUnstable,
      aborted: countAborted,
      disabled: countDisabled,
      total: total
    };

  }


  function crawlJenkinsJobs(instanceURL) {
    var connection = instanceURL + '/api/json?tree=jobs[name,buildable,color,jobs[name,buildable,color,jobs[name,buildable,color,jobs[name,buildable,color,jobs]]]]&pretty';
    return $http({
      method: 'GET',
      url: connection,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (response) {
      var jobItems = [];
      jobItems = resolveJobFolder(response.data, jobItems);
      return jobItems;
    })
  }

  function resolveJobFolder(job, jobItems) {
    var folderName = job.name;
    job.jobs.forEach(function (job) {
      if (job.buildable) {
        if (folderName === undefined || folderName == null) {
          jobItems.push({name: job.name, color: job.color});
        } else {
          jobItems.push({name: folderName + " / " + job.name, color: job.color});
        }
      }
      if (job.jobs) {
        resolveJobFolder(job, jobItems);
      }
    });
    return jobItems;
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
    }).then(function (response) {
      return response.data.jobs;
    })
  }

  //returns information for a defined range of builds
  function getLastBuilds(apiUrl) {
    return getJobList(apiUrl);
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
    }).then(function (response) {
      var status = response.data.result;
      var url = response.data.url;
      var projectFullName = response.data.fullDisplayName;
      var imgUrl = imgURLBuildUnstable;
      if (status == "SUCCESS") {
        imgUrl = imgURLBuildSuccess;
      }
      else if (status == "FAILURE") {
        imgUrl = imgURLBuildFailed;
      }

      var lastCommit = response.data.changeSet.items[0];
      var lastCommitMsg = defaultMsgNoCommitInfo;
      var lastCommitBy = defaultMsgNoAuthor;
      if (lastCommit) {
        lastCommitBy = lastCommit.author.fullName;
        lastCommitMsg = lastCommit.msg;
      }

      return {
        status: status,
        url: url,
        lastCommitBy: lastCommitBy,
        lastCommitMsg: lastCommitMsg,
        imgUrl: imgUrl,
        projectFullName: projectFullName
      };
    })
  }

  //returns statistics over the whole jenkins instance
  function getJobStats(apiUrl) {
    return crawlJenkinsJobs(apiUrl).then(parseStats);
  }

  //setup the functions called by widget
  return {
    getJobList: getJobList,
    getJobStats: getJobStats,
    getJobData: getJobData,
    getLastBuilds: getLastBuilds,
    crawlJenkinsJobs: crawlJenkinsJobs
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
      jenkinsApi.crawlJenkinsJobs(url).then(function(data) {
        data.forEach(function(project) {
          var proj = {
            name: project.name
          };
          vm.projects.push(proj);
        });
      });
    };
    $scope.updateProjects();
  }]);
})(window);