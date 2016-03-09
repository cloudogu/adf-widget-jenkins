'use strict'

jenkinsWidget.controller('jenkinsChart', function(data) {
  //get chart data
  var jc = this;
  jc.data = data;

  //configure chart
  var labels = ["Stable", "Fail","Unstable","Diabled"];
  var values = [jc.data.stable,jc.data.fail,jc.data.unstable,jc.data.disabled];
  var colors = ['#ABC8D7','#F7464A','#FDB45C','#DCDCDC'];
  jc.chartLabels = labels;
  jc.chartValues = values;
  jc.chartColors = colors;
});
