/*
Julia Jelgerhuis - 10725482
Week 4 Scatterplot
Minor programmeren - dataprocessing
*/

window.onload = function loadData() {
  console.log('Yes, you can!')
  var datasetAll = "https://stats.oecd.org/SDMX-JSON/data/CSPCUBE/NATINCCAP_T1+HOURSWKD_T1+LIFEEXPY_G1.DNK+FIN+ITA+LVA+NLD+POL+ESP+GBR+USA/all?startTime=2011&endTime=2015&dimensionAtObservation=allDimensions"

  d3.queue()
    .defer(d3.request, datasetAll)
    .awaitAll(getData);
    
  function getData(error, response) {
    if (error) throw error;

    // call dropdown menu
    dropdownMenu();

    // use response to get data
    var data = JSON.parse(response[0].responseText)
    var datapoints = data.dataSets[0].observations
    
    var countries = []
    
    // add country names to array
    for (let i = 0; i < 9; i++){
      countries.push(data.structure.dimensions.observation[1].values[i].name)
    };

    var allCountries = [];
    var GNIvalues = [];
    var LIFEvalues = [];
    var HOURSvalues = [];

    // loop over datapoints
    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 9; j++){
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
    for (let i = 0; i < 9; i++){
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
    
    function dropdownMenu(){
      var data = [0, 1, 2, 3, 4];

      var select = d3.select("body")
                    .append("select")
                    .attr("class","select")
                    .on("change", onchange)

      var options = select.selectAll("option")
                          .data(data)
                          .enter()
                          .append("option")
                          .text(function (d) { return d; });

      function onchange() {
        selectValue = d3.select("select").property("value")
        console.log(selectValue)
        drawGraph(allCountries, selectValue)
      };
    };   
    /* Create SVG and its elements */
    // height, width, and margins
    function drawGraph(allCountries, years) {
    totalHeight = 700;
    totalWidth = 900;
    padding = 20;
    
    margin = {"left": 90, "right": 40, "top": 80, "bottom": 50};

    graphHeight = totalHeight - margin.top - margin.bottom;
    graphWidth = totalWidth - margin.left - margin.right;
    
    minGNI = [];
    maxGNI = [];
    minLIFE = [];
    maxLIFE = [];
    minHOURS = [];
    maxHOURS = [];

    // domains and ranges
    for (let i = 0; i < 9; i++){
      minGNI.push(Math.min.apply(null, allCountries[i].GNI))
      minLIFE.push(Math.min.apply(null, allCountries[i].LIFE))
      minHOURS.push(Math.min.apply(null, allCountries[i].HOURS))
      maxGNI.push(Math.max.apply(null, allCountries[i].GNI))
      maxLIFE.push(Math.max.apply(null, allCountries[i].LIFE))
      maxHOURS.push(Math.max.apply(null, allCountries[i].HOURS))
    }

    var domainX = [Math.floor(Math.min.apply(null, minLIFE)), Math.ceil(Math.max.apply(null, maxLIFE))] 
    var domainY = [Math.floor(Math.min.apply(null, minGNI)), 75000] 

    var rangeX = [margin.left, graphWidth];
    var rangeY = [graphHeight - margin.top, margin.bottom];

    // x and y scales
    var xScale = d3.scaleLinear()
                   .range(rangeX)
                   .domain(domainX)
    
    var yScale = d3.scaleLinear()
                   .range(rangeY)
                   .domain(domainY)

    d3.select("svg").remove();
    
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
    var color = d3.scaleOrdinal().range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99',
                                            '#e31a1c','#fdbf6f','#ff7f00','#cab2d6']);
    

    var legend = svg.selectAll(".legend")
                    .data(countries)
                    .enter()
                    .append("g")
                    .classed("legend", true)
                    .attr("transform", function(d, i) {
                        return "translate(0," + i * 20 + ")";
                    })
                   
    legend.append("rect")
          .attr("x", graphWidth + 20)
          .attr("width", 12)
          .attr("height", 12)
          .style("fill", color);  
    
    legend.append("text")
          .attr("class", "text-legend")
          .attr("x", graphWidth + 40)
          .attr("y", 7)
          .attr("dy", ".35em")
          .style("text-anchor", "begin")
          .text(function(d, i){
            return allCountries[i].NAME
          });                                      

    // sizes for dots
    var sizes = [5, 8, 11];
    
    // create tip for tooltip
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-5, 0])
                .html(function(d) {
                  var tipText = "<strong>Country:</strong> <span style='color:red'>" + d.NAME + "</span>" + "<br>" + 
                                    "<strong>Hours worked:</strong> <span style='color:red'>" + d.HOURS[years] + "</span>" + "<br>";
                    return tipText;
                })                                        

    // call tip in svg
    svg.call(tip);

    // create datapoints
    svg.selectAll("circle")
       .data(allCountries)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
        return xScale(d.LIFE[years]);
       })
       .attr("cy", function(d) {
        return yScale(d.GNI[years]);
       })
       .attr("r", function(d){
         if (d.HOURS[years] <= 1500){
           return sizes[0];
         }
         if (d.HOURS[years] >= 1800){
           return sizes[2];
         }
         else{
           return sizes[1];
         }
       })
       .attr("fill", function(d, i) {
        return color(i);
       })
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);  
  };
};
};  