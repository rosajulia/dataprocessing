/* 
Julia Jelgerhuis - 10725482 
Minor Programmeren - Dataprocessing
Homework week 6 - Linked Views

Javascript code to update linked.html.
*/

window.onload = function loadData() {

    // load data
    d3.queue()
      .defer(d3.json, "vacdata.json")
      .defer(d3.json, "nl.json")
      .awaitAll(function(error, response){
          if (error) throw error;

          var graphData = [];
          graphData.push(response[0], response[1]);
          makeGraph(graphData);
        });
};

function makeGraph(data, yearSelected=2010){
    updateGraph(data);

    // initialize data
    var vacData = data[0],
        nld = data[1];
        legendData = [90, 93, 95, 100],
        year = yearSelected;

    

    d3.select("svg").remove();

    // initialize svg
    var totalHeight = 700,
        totalWidth = 900,
        padding = 20;
    
    margin = {"left": 90, "right": 40, "top": 80, "bottom": 50};

    var graphHeight = totalHeight - margin.top - margin.bottom;
    var graphWidth = totalWidth - margin.left - margin.right;
    
    var svg = d3.select("body").append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight);

    // initialize properties of map
    var projection = d3.geoMercator()
        .scale(1)
        .translate([0.03, 0]);

    var path = d3.geoPath()
        .projection(projection);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);

    var l = topojson.feature(nld, nld.objects.subunits).features[3],
        b = path.bounds(l),
        s = .2 / Math.max((b[1][0] - b[0][0]) / graphWidth - 500, (b[1][1] - b[0][1]) / graphHeight),
        t = [(graphWidth - s * (b[1][0] + b[0][0])) / 2, (graphHeight - s * (b[1][1] + b[0][1])) / 2];
    
    projection
        .scale(s)
        .translate(t);
    
    svg.append("path1")
        .datum(topojson.mesh(nld, nld.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
        .attr("d", path)
        .attr("class", "subunit-boundary");

    svg.selectAll("path")
        .data(topojson.feature(nld, nld.objects.subunits).features).enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d, i) {
            if(vacData[i][year] <= legendData[0]){
                return d3.interpolateReds(1)
            };
            if(vacData[i][year] > legendData[0] && vacData[i][year] <= legendData[1]){
                return d3.interpolateReds(0.8)
            };
            if(vacData[i][year] > legendData[1] && vacData[i][year] <= legendData[2]){
                return d3.interpolateReds(0.4)
            };
            if(vacData[i][year] > legendData[2]){
                return d3.interpolateReds(0.2)
            };
        })
        .attr("class", function(d, i) {
            return d.properties;
        })
        .on("mouseover", function(d, i) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html("<span>" + d.properties.name + ":" + vacData[i][year] + "%" + "</span>")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
            });
    
    var legend = svg.selectAll(".legend")
    .data(legendData)
    .enter()
    .append("g")
    .classed("legend", true)
    .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
    })
    
    legend.append("rect")
    .attr("x", 20)
    .attr("y", 20)
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", function(d, i) {
        if(vacData[i][year] <= 90){
            return d3.interpolateReds(1)
        };
        if(vacData[i][year] > 90 && vacData[i][year] <= 93){
            return d3.interpolateReds(0.8)
        };
        if(vacData[i][year] > 93 && vacData[i][year] <= 95){
            return d3.interpolateReds(0.4)
        };
        if(vacData[i][year] > 95){
            return d3.interpolateReds(0.2)
        };
    });  

    legend.append("text")
    .attr("class", "text")
    .attr("x", 40)
    .attr("y", 27)
    .attr("dy", ".35em")
    .style("text-anchor", "begin")
    .text(function(d, i) {
        if(i == 0){
            return "<90%"
        };
        if(i == 1){
            return "90% - 93%"
        };
        if(i == 2){
            return "93% - 95%"
        };
        if(i == 3){
            return ">95%"
        };
    })
};

function updateGraph(data) {
    // load and update slider
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    slider.oninput = function() {
    output.innerHTML = this.value;
    makeGraph(data, this.value)
    };
}