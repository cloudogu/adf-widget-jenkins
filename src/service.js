'use strict';

jenkinsWidget
  .factory('jenkinsApi', jenkinsApi);


//function factory jenkinsStats
function jenkinsApi($http) {

  function createApiConnection(apiUrl) {

    return apiUrl + '/api/json/jobs';
  }
  function parseXML(response, filter){

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
       var jenkinsJobs;
       //for(var i=0;i<response.length;i++){
       // jenkinsJobs[i] = response.data.jobs[i].name;
       //}
       jenkinsJobs = response.data.jobs
       return jenkinsJobs;
     })
   }
  return {
    getData: getData
  };
}
