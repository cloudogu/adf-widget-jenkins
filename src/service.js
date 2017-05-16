'use strict';

jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);



//function factory jenkinsStats
function jenkinsApi($http) {

  const imgURLBuildSuccess = 'src/images/success.png';
  const imgURLBuildFailed = 'src/images/failed.png';
  const imgURLBuildUnstable = 'src/images/unstable.png';
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
