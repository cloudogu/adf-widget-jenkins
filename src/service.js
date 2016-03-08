'use strict';

jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);


//function factory jenkinsStats
function jenkinsApi($http) {

  function createApiConnection(apiUrl) {

    return apiUrl + '/api/json/jobs';
  }
  function parseStats(jobList){
    var countStable=0;var countUnstable=0;var countFail=0;
    var countDisabled=0; var countAborted;
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
      disabled: countDisabled,total:total,joblist:jobList};
    return jenkinsStats;
  }



  function getData(apiUrl) {
    var connection = createApiConnection(apiUrl);
    return $http({
       method: 'GET',
       url: connection,
       headers: {
         'Accept': 'application/json'
       }
     }).then(function(response){
       var jobList = response.data.jobs;
       var jenkinsStats = parseStats(jobList);
       return jenkinsStats;
     })
   }
  return {
    getData: getData
  };
}
