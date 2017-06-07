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
        templateUrl: '{widgetsPath}/jenkins/src/charts/edit.html',
        controller: 'projectViewEditController',
        controllerAs: 'vm'
      }
    });
}
registerWidget.$inject = ["dashboardProvider"];

angular.module("adf.widget.jenkins").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/jenkins/src/edit.html","<form role=form><div class=form-group><label ng-if=!vm.url>Connection Setup</label><p ng-if=!vm.url><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text ng-change=vm.updateProjectList(config.apiUrl)></p><label>Project</label> <input type=text ng-model=config.project uib-typeahead=\"project.name for project in vm.projects | filter:$viewValue | limitTo:10\" class=form-control></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/view.html","<style type=text/css>\n\n  .statusImg {\n    max-width: 100px;\n  }\n\n</style><div><div class=content><div class=\"alert alert-info\" ng-if=!vm.data>Please configure a project</div><div ng-if=vm.data><div class=\"col-md-6 col-xs-6\"><a href=\'{{vm.data.url}}target=\"_blank\"\'><h4>{{vm.data.projectFullName}}</h4></a><p><b>Last Commit:</b> {{vm.data.lastCommitMsg}}</p><p><b>Author:</b> {{vm.data.lastCommitBy}}</p></div><div ng-if=vm.data.imgSource class=\"col-md-6 col-xs-6 pull-right\"><img src={{vm.data.imgSource}} class=\"statusImg pull-right\"></div></div></div></div>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/edit.html","<form role=form><div ng-if=!vm.url class=form-group><label>Connection Setup</label><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text></p></div></form>");
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

  const imgBuildSuccess = 'data:image/png;base64,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';
  const imgBuildFailed = 'data:image/png;base64,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';
  const imgBuildUnstable = 'data:image/png;base64,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';
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
      return resolveJobFolder(response.data);
    })
  }

  function resolveJobFolder(job) {
    var folderName = job.name;
    var jobItems = [];
    job.jobs.forEach(function (job) {
      if (job.buildable) {
        if (folderName === undefined || folderName == null) {
          jobItems.push({name: job.name, color: job.color});
        } else {
          jobItems.push({name: folderName + " / " + job.name, color: job.color});
        }
      }
      if (job.jobs) {
        jobItems.push(resolveJobFolder(job));
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
      var imgSource = imgBuildUnstable;
      if (status == "SUCCESS") {
        imgSource = imgBuildSuccess;
      }
      else if (status == "FAILURE") {
        imgSource = imgBuildFailed;
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
        imgSource: imgSource,
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

    vm.updateProjectList = updateProjectList;

      if (jenkinsEndpoint.url){
        vm.url = jenkinsEndpoint.url;
      }


      updateProjectList(vm.url);

     function updateProjectList(url){
       var projects = [];
        jenkinsApi.crawlJenkinsJobs(url).then(function(data) {
          data.forEach(function(project) {
            var proj = {
              name: project.name
            };
            projects.push(proj);
          });
        });
       vm.projects =  projects;
      }



  }]);
})(window);