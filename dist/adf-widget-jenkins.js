(function(window, undefined) {'use strict';


function registerWidget(dashboardProvider) {
  const category = 'Jenkins';

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

const jenkinsWidget = angular.module('adf.widget.jenkins', ['adf.provider', 'chart.js', 'ui.bootstrap'])
  .constant("jenkinsEndpoint", {
    "url": "" //https://builds.apache.org/
  })
  .config(registerWidget);

angular.module("adf.widget.jenkins").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/jenkins/src/edit.html","<form role=form><div class=form-group><label ng-if=!vm.url>Connection Setup</label> <span ng-if=!vm.url class=\"glyphicon glyphicon-info-sign ng-scope\" uib-tooltip-html=connectionSetupTooltip tooltip-trigger=\"\'outsideClick\'\" tooltip-is-open=connectionSetupTooltipIsOpen ng-mouseover=\"connectionSetupTooltipIsOpen = !connectionSetupTooltipIsOpen\" tooltip-placement=bottom aria-label=\"Enter the URL to the Jenkins API server. A valid URL starts with http:// or https://. You can test the widget with the URL https://builds.apache.org/ .\"></span><p ng-if=!vm.url><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text ng-change=vm.updateProjectList(config.apiUrl)></p><label>Project</label> <span class=\"glyphicon glyphicon-info-sign ng-scope\" uib-tooltip=\"Select a project by typing its name. Auto-completion shows matching projects to select from. Review your URL if no projects are displayed.\" tooltip-trigger=\"\'outsideClick\'\" ng-mouseover=\"projectTooltipIsOpen = !projectTooltipIsOpen\" tooltip-is-open=projectTooltipIsOpen tooltip-placement=top aria-label=\"Select a project by typing its name. Auto-completion shows matching projects to select from. Review your URL if no projects are displayed.\"></span> <input type=text ng-model=config.project uib-typeahead=\"project.name for project in vm.projects | filter:$viewValue | limitTo:10\" class=form-control></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/view.html","<style type=text/css>\n  .statusImg {\n    max-width: 100px;\n  }\n  .break-word {\n    word-wrap: break-word\n  }\n  a > h3 {\n    font-size: 18px;\n    margin-top: 10px;\n    margin-bottom: 10px;\n  }\n  .glyphicon-info-sign{\n    margin-left: 3px;\n  }\n\n</style><div><div class=content><div class=\"alert alert-info\" ng-if=!vm.data>Please configure a project</div><div ng-if=vm.data><div class=\"col-md-7 col-xs-7\"><a href={{vm.data.url}} target=_blank class=break-word><h3>{{vm.data.projectFullName}}</h3></a><p><b>Last Commit:</b> {{vm.data.lastCommitMsg}}</p><p><b>Author:</b> {{vm.data.lastCommitBy}}</p></div><div ng-if=vm.data.imgSource class=\"col-md-5 col-xs-5 pull-right\"><img ng-src={{vm.data.imgSource}} class=\"statusImg pull-right\"></div></div></div></div>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/edit.html","<form role=form><div ng-if=!vm.url class=form-group><label>Connection Setup</label> <span class=\"glyphicon glyphicon-info-sign ng-scope\" uib-tooltip-html=connectionSetupTooltip tooltip-trigger=\"\'outsideClick\'\" tooltip-is-open=tooltipIsOpen ng-mouseover=\"tooltipIsOpen = !tooltipIsOpen\" tooltip-placement=bottom aria-label=\"Enter the URL to your Jenkins API server. A valid URL starts with http:// or https://. You can test the widget with the URL https://builds.apache.org/ .\"></span><p><input class=form-control id=apiUrl ng-model=config.apiUrl placeholder=\"Enter Api-Url\" type=text></p></div></form>");
$templateCache.put("{widgetsPath}/jenkins/src/charts/view.html","<style type=text/css>\n  #stable{\n    background-color: #B5CA00;\n  }\n  #failed{\n    background-color: #E43B53;\n  }\n  #unstable{\n    background-color: #DD7800;\n  }\n  #disabled{\n    background-color: #777777;\n  }\n  .content>.counter>p{\n    color:white;\n    margin: 20px 0 10px;\n    font-size: xx-large;\n  }\n  .content>.counter  {\n    outline: 2px solid #ddd;\n    height: 100px;\n    color: white;\n  }\n  #doughnut.center{\n    margin: 0 auto;\n  }\n  .glyphicon-info-sign{\n    margin-left: 3px;\n  }\n\n</style><div><div class=content><canvas id=doughnut class=\"chart chart-doughnut center\" chart-data=jc.chartValues chart-labels=jc.chartLabels chart-colors=jc.chartColors></canvas><div class=\"counter col-md-6\" id=stable><p>{{jc.data.stable || 0}}</p>stable builds</div><div class=\"counter col-md-6\" id=unstable><p>{{jc.data.unstable || 0}}</p>unstable builds</div><div class=\"counter col-md-6\" id=failed><p>{{jc.data.fail || 0}}</p>failed builds</div><div class=\"counter col-md-6\" id=disabled><p>{{jc.data.aborted+jc.data.disabled || 0}}</p>disabled builds</div></div></div>");}]);
'use strict'

jenkinsWidget.controller('jenkinsChart', ["data", function(data) {
  //get chart data
  var jc = this;
  jc.data = data;

  //configure chart
  var labels = ["Stable", "Fail","Unstable","Diabled"];
  var values = [jc.data.stable,jc.data.fail,jc.data.unstable,jc.data.disabled];
  var colors = ['#B5CA00','#E43B53','#DD7800','#777777'];
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
  function createProjectConnection(apiUrl, jobName) {
    var convertedJobName = convertJobName(jobName);
    return apiUrl + '/job/' + convertedJobName + '/lastBuild/api/json';
  }

  // convert compound job names (e.g. for organizations or folders) to fit jenkins rest api
  function convertJobName(jobName) {
    return jobName.replace(/\//g, "/job/");
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
      return resolveJobFolder(response.data, "");
    })
  }

  function resolveJobFolder(job, folder) {
    var folderName = folder;
    if (job.name) {
      if (folderName) {
        folderName += '/';
      }
      folderName += job.name;
    }
    var jobItems = [];
    job.jobs.forEach(function (childJob) {
      if (childJob.buildable) {
        if (!folderName) {
          jobItems = jobItems.concat({ name: childJob.name, color: childJob.color });
        } else {
          jobItems = jobItems.concat({ name: folderName + "/" + childJob.name, color: childJob.color });
        }
      }
      if (childJob.jobs) {
        jobItems = jobItems.concat(resolveJobFolder(childJob, folderName));
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

      var changeset = response.data.changeSet;
      if (!changeset) {
        if (response.data.changeSets) {
          changeset = response.data.changeSets[0];
        }
      }
      var lastCommitMsg = defaultMsgNoCommitInfo;
      var lastCommitBy = defaultMsgNoAuthor;
      if (changeset && changeset.items) {
        var lastIndex = changeset.items.length - 1;
        var lastCommit = changeset.items[lastIndex];
        if (lastCommit) {
          lastCommitBy = lastCommit.author.fullName;
          lastCommitMsg = lastCommit.msg;
        }
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
  .controller('projectViewEditController', ["jenkinsApi", "$scope", "$sce", "jenkinsEndpoint", function (jenkinsApi, $scope, $sce,jenkinsEndpoint) {

    // tooltip for project
    $scope.connectionSetupTooltip = $sce.trustAsHtml('Enter the URL to your Jenkins API server. A valid URL starts with http:// or https://. You can test the widget with the URL https://builds.apache.org/ .');

    var vm = this;

    vm.updateProjectList = updateProjectList;

    if (jenkinsEndpoint.url) {
      vm.url = jenkinsEndpoint.url;
    }

    updateProjectList(vm.url);

    function updateProjectList(url) {
      var projects = [];
      jenkinsApi.crawlJenkinsJobs(url).then(function (data) {
        data.forEach(function (project) {
          var proj = {
            name: project.name
          };
          projects.push(proj);
        });
      });
      vm.projects = projects;
    }

  }]);
})(window);