'use strict'

jenkinsWidget.controller('jenkinsChart', function(data) {
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

});
