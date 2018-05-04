/*
Julia Jelgerhuis - 10725482
Week 4 Scatterplot
Minor programmeren - dataprocessing
*/

window.onload = function loadData() {
  console.log('Yes, you can!')
  var datasetAll = "http://stats.oecd.org/SDMX-JSON/data/CSPCUBE/NATINCCAP_T1+HOURSWKD_T1+LIFEEXPY_G1.DNK+FIN+ITA+LVA+NLD+POL+ESP+CHE+GBR+USA/all?startTime=2011&endTime=2015&dimensionAtObservation=allDimensions"

  d3.queue()
    .defer(d3.request, datasetAll)
    .awaitAll(getData);
    
  function getData(error, response) {
    if (error) throw error;

    // use response to get data
    var data = JSON.parse(response[0].responseText)
    var datapoints = data.dataSets[0].observations
    
    var countries = []
    
    // add country names to array
    for (let i = 0; i < 10; i++){
      countries.push(data.structure.dimensions.observation[1].values[i].name)
    };

    var allCountries = [];
    var GNIvalues = [];
    var LIFEvalues = [];
    var HOURSvalues = [];

    // loop over datapoints
    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 10; j++){
        for (let k = 0; k < 5; k++){
          var key = i + ":" + j + ":" + k
          if (i == 0){
            GNIvalues.push(datapoints[key][0])
          }
          if (i == 1){
            HOURSvalues.push(datapoints[key][0])
          }
          if (i == 2){
            LIFEvalues.push(datapoints[key][0])
          }
        }
      }
    };
    
    // store country objects
    var allCountries = []

    // give country values
    for (let i = 0; i < 10; i++){
      var countryObj = {
        "NAME": countries[i]
      }
      // add GNI
      countryObj.GNI = []
      countryObj.GNI.push(GNIvalues.splice(0, 5))
      countryObj.GNI = countryObj.GNI[0]

      // add life expectancy
      countryObj.LIFE = []
      countryObj.LIFE.push(LIFEvalues.splice(0, 5))
      countryObj.LIFE = countryObj.LIFE[0]

      // add hours worked
      countryObj.HOURS = []
      countryObj.HOURS.push(HOURSvalues.splice(0, 5))
      countryObj.HOURS = countryObj.HOURS[0]
      
      allCountries.push(countryObj)
    }

    console.log(allCountries)

    /* Create SVG and its elements */
    // height, width, and margins
    totalHeight = 600;
    totalWidth = 900;
    padding = 20;
    
    margin = {"left": 90, "right": 20, "top": 60, "bottom": 50};

    graphHeight = totalHeight - margin.top - margin.bottom;
    graphWidth = totalWidth - margin.left - margin.right;
    
    minGNI = [];
    maxGNI = [];
    minLIFE = [];
    maxLIFE = [];

    // domains and ranges
    for (let i = 0; i < 10; i++){
      minGNI.push(Math.min.apply(null, allCountries[i].GNI))
      minLIFE.push(Math.min.apply(null, allCountries[i].LIFE))
      maxGNI.push(Math.max.apply(null, allCountries[i].GNI))
      maxLIFE.push(Math.max.apply(null, allCountries[i].LIFE))
    }

    var domainX = [Math.floor(Math.min.apply(null, minLIFE)), Math.ceil(Math.max.apply(null, maxLIFE))] 
    var domainY = [Math.floor(Math.min.apply(null, minGNI)), Math.ceil(Math.max.apply(null, maxGNI))] 

    var rangeX = [margin.left, graphWidth];
    var rangeY = [graphHeight - margin.top, 0];

    // x and y scales
    var xScale = d3.scaleLinear()
                   .range(rangeX)
                   .domain(domainX)
    
    var yScale = d3.scaleLinear()
                   .range(rangeY)
                   .domain(domainY)

    var svg = d3.select("body")
                .append("svg")
                .attr("width", totalWidth)
                .attr("height", totalHeight);
    
    var xAxis = d3.axisBottom()
                  .scale(xScale)
    var yAxis = d3.axisLeft()
                  .scale(yScale)

    // write axis to graph
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + graphHeight + ")")
       .call(xAxis);
 
    svg.append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
       .attr("class","axis")
       .call(yAxis);
    
    // text label for x axis
    svg.append("text") 
       .attr("class", "axisLabel")            
       .attr("transform", "translate(" + ((graphWidth - margin.left) / 2) + " ," + 
                                      (graphHeight + margin.top) + ")")
       .text("Life expectancy (years)");

    // text label for y axis
    svg.append("text")
       .attr("class", "axisLabel")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 + margin.right - padding)
       .attr("x",0 - (graphHeight / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("GNI (dollars)");   
    
    // colors for dots
    var color = d3.scaleOrdinal().range(["#ECDB54", "#E94B3C", "#6F9FD8", "#944743", "#DBB1CD",
                                            "#EC9787", "#00A591", "#6B5B95", "#6C4F3D", "#FF1A1A"]);
    
    // create tip for tooltip
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-5, 0])
                .html(function(d) {
                    return "<strong>Country:</strong> <span style='color:red'>" + d.NAME + "</span>";
    })                                        

    // call tip in svg
    svg.call(tip);

    // create datapoints
    svg.selectAll("circle")
       .data(allCountries)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
        return xScale(d.LIFE[0]);
       })
       .attr("cy", function(d) {
              return yScale(d.GNI[0]);
       })
       .attr("r", 5)
       .attr("fill", function(d, i) {
        return color(i);
       })
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
  };
};  