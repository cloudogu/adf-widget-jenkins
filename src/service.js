'use strict';

jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);


//function factory jenkinsStats
function jenkinsApi($http) {

  function createApiConnection(apiUrl) {

    return apiUrl + '/api/json/jobs';
  }
  function createProjectConnection(apiUrl, project){
    return apiUrl + '/job/'+project+'/lastBuild/api/json';
  }
  function parseStats(jobList){
    var countStable=0;var countUnstable=0;var countFail=0;
    var countDisabled=0; var countAborted=0;
    var total = jobList.length;
    for (var i = 0; i < total; i++) {
      if (jobList[i].color == 'blue'){
        countStable++;
      }
      if (jobList[i].color == 'red'){
        countFail++;
      }
      if (jobList[i].color == 'yellow'){
        countUnstable++;
      }
      if (jobList[i].color =='notbuilt' || jobList[i].color =='disabled'){
        countDisabled++;
      }
      if (jobList[i].color == 'aborted'){
        countAborted++;
      }
    }
    var jenkinsStats = {stable:countStable,fail:countFail,unstable:countUnstable,aborted: countAborted,
      disabled: countDisabled,total:total};
    return jenkinsStats;
  }

  function getJobList(apiUrl){
    var connection = createApiConnection(apiUrl);
    return $http({
       method: 'GET',
       url: connection,
       headers: {
         'Accept': 'application/json'
       }
     }).then(function(response){
       return response.data.jobs;
     })
  }

  function getJobData(apiUrl,project) {
    var connection = createProjectConnection(apiUrl,project);
    return $http({
       method: 'GET',
       url: connection,
       headers: {
         'Accept': 'application/json'
       }
     }).then(function(response){
       var status = response.data.result;
       var url = response.data.url;
       var imgUrl = "";
       if(status == "SUCCESS"){
         imgUrl = "src/img/thumbUp.png"
       }
       if (status == "FAILURE") {
         imgUrl = "src/img/thumbDown.png";
       }

       var lastCommitBy = response.data.changeSet.items[0].author.fullName;
       var lastCommitMsg = response.data.changeSet.items[0].msg;
       var projectInfo = {status:status,url:url,lastCommitBy:lastCommitBy,lastCommitMsg:lastCommitMsg, imgUrl: imgUrl};

       return projectInfo;
     })
   }

  function getJobStats(apiUrl){
    return getJobList(apiUrl).then(parseStats);
  }


  return {
    getJobStats: getJobStats,
    getJobData: getJobData
  };
}
