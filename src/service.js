'use strict';

jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);


//function factory jenkinsStats
function jenkinsApi($http) {

  function createApiConnection(apiUrl) {

    return apiUrl + '/api/json/jobs';
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
       var jenkinsJobs = response.data.jobs;
       return jenkinsJobs;
     })
   }
  return {
    getData: getData
  };
}
