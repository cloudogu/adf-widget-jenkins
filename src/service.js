'use strict';

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
