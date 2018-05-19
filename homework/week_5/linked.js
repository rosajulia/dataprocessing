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
      .defer(d3.json, "reldata.json")
      .awaitAll(function(error, response){
          if (error) throw error;

          var graphData = [];
          graphData.push(response[0], response[1], response[2]);
          prepData(graphData)
        });
};

function prepData(data) {
    vacData = data[0]
    nld = data[1]
    relData = data[2]
    
    Groningen = ["Groningen"];
    Friesland = ["Friesland"];
    Drenthe = ["Drenthe"];
    Overijssel = ["Overijssel"];
    Utrecht = ["Utrecht"];
    Zeeland = ["Zeeland"];
    Limburg = ["Limburg"];
    NoordBrabant = ["Noord-Brabant"];
    ZuidHolland = ["Zuid-Holland"];
    NoordHolland = ["Noord-Holland"];
    Gelderland = ["Gelderland"];
    Flevoland = ["Flevoland"];

    provinces = [Groningen, Friesland, Drenthe, Overijssel, Utrecht, Zeeland, Limburg, NoordBrabant,
        ZuidHolland, NoordHolland, Gelderland, Flevoland]

    for (let i = 0; i < provinces.length; i++){
        for (let j = 0; j < relData.length; j++){
            if (provinces[i][0] == relData[j].Provincie){
                provinces[i].push(relData[j]);
            };
        };
        provinces[i].splice(0, 1)
    ;}
    createChart(provinces)
    createMap(vacData, nld, provinces)
}

function createMap(vacData, nld, provinces, yearSelected=2010){

    // load and update slider
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    // make graph with output slider
    slider.oninput = function() {
    output.innerHTML = this.value;
    // svgMap.select().remove();
    d3.selectAll("svg").remove();
    createChart(provinces, province="Groningen", this.value)
    createMap(vacData, nld, provinces, this.value)
    };

    // svg.selectAll("*").remove();

    // initialize data
    var vacData = vacData,
        nld = nld,
        provinces = provinces,
        legendData = [90, 93, 95, 100],
        legendColor = [1, 0.8, 0.4, 0.2]
        legendText = ["<90%", "90% - 93%", "93% - 95%", ">95%"]
        year = yearSelected;

    // remove old svg
    // d3.select(".svgMap").exit();

    // initialize new svg
    var totalHeight = 600,
        totalWidth = 690,
        padding = 20;
    
    margin = {"left": 90, "right": 40, "top": 80, "bottom": 50};

    var graphHeight = totalHeight - margin.top - margin.bottom;
    var graphWidth = totalWidth - margin.left - margin.right;
    
    var svgMap = d3.selectAll(".svgMap").append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight);
        
    // d3.select(".svgMap").remove();
        // d3.select("svgAll.svgMap").remove();

    var g = svgMap.append("g");

    // define the div for the tooltip
    var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);

    // initialize properties of map
    var projection = d3.geoMercator()
        .scale(1)
        .translate([0, 0]);

    var path = d3.geoPath()
        .projection(projection);

    g.selectAll(path)
    var l = topojson.feature(nld, nld.objects.subunits).features[3],
        b = path.bounds(l),
        s = .2 / Math.max((b[1][0] - b[0][0]) / graphWidth - 500, (b[1][1] - b[0][1]) / graphHeight),
        t = [(graphWidth - s * (b[1][0] + b[0][0])) / 2, (graphHeight - s * (b[1][1] + b[0][1])) / 2];
    
    projection
        .scale(s)
        .translate(t);

    g.selectAll("path")
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
            })
        .on("click", function(d, i) {
            createChart(provinces, d.properties.name, year);
        });
    
    // initialize legend
    var legend = svgMap.selectAll(".legend")
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
        return d3.interpolateReds(legendColor[i])
    });  

    legend.append("text")
    .attr("class", "text")
    .attr("x", 40)
    .attr("y", 27)
    .attr("dy", ".35em")
    .style("text-anchor", "begin")
    .text(function(d, i) {
        return legendText[i]
    });

    // call for update
    // update(vacData, nld, provinces);
};

function createChart(data, province="Groningen", year=2010) {

    // load data
    provinceData = [];
    provinceYearData = [];

    // pick right data for year and province
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < 6; j++) {
            if (data[i][j].Provincie == province) {
                 provinceData.push(data[i][j])
            }
        }
    }

    // clean objects from year and province
    for (let i = 0; i < provinceData.length; i++) {
        if (provinceData[i].Jaar == year) {
            provinceYearData.push(provinceData[i])
        }
    }

    // assign object data to arrays
    relNames = Object.keys(provinceYearData[0])
    relValues = Object.values(provinceYearData[0])

    relNames.splice(0,2)
    relValues.splice(0, 2)

    d3.selectAll('.svgChart svg').remove();

    // initialize chart SVG
    totalHeight = 600;
    totalWidth = 700;
    margin = {"left": 100, "right": 100, "top": 20, "bottom": 120};
    
    var graphWidth = totalWidth - margin.left - margin.right; 
    var graphHeight = totalHeight - margin.top - margin.bottom;
    var barPadding = 2; 
    var barWidth = ((graphWidth - barPadding * 7) / 7);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

        
    
    var svgChart = d3.select(".svgChart").append("svg")
                    .attr("width", totalWidth)
                    .attr("height", totalHeight);
    
    // create x-axis
    var xScale = d3.scaleBand()
                //    .domain(relNames)
                   .rangeRound([margin.left, totalWidth - margin.right]);
    
    var xAxis = d3.axisBottom()
                  .scale(xScale)
    
    var yScale = d3.scaleLinear()
                   .domain([(Math.max(...relValues) + barPadding), 0])
                   .range([margin.top, graphHeight + margin.top]);

    var yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(5);

    // write axis to graph
    svgChart.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (graphHeight + margin.top + margin.top) + ")")
       .call(xAxis);
 
    svgChart.append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
       .attr("class","axis")
       .call(yAxis);
    
    // text label for x axis
    svgChart.append("text") 
       .attr("class", "axisLabel")            
       .attr("transform", "translate(" + (graphWidth / 2 + margin.left) + " ," + (graphHeight + margin.bottom - margin.top) + ")")

    // text label for y axis
    svgChart.append("text")
       .attr("class", "axisLabel")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left + margin.right + 10)
       .attr("x", 0 - (graphHeight / 2) - margin.top)
       .attr("dy", "1em")
       .text("% van de bevolking");   
    
    // create tip for tooltip
    var tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-5, 0])
                .html(function(d, i) {return  relValues[i] + "%";
                });

    // call tip in svgChart
    svgChart.call(tip);

    // create bars
    svgChart.selectAll("rect")
       .data(relValues)
       .enter()
       .append("rect")
       .attr("x", function(d, i) {
         return i * (barWidth + barPadding) + margin.left
        })
       .attr("y", function(d, i) {return yScale(relValues[i]) + margin.top})
       .attr("height", function(d, i) {return totalHeight - yScale(relValues[i]) - margin.bottom})  
       .attr("width", barWidth)
       .attr("fill", function(d, i) {return color(d)})
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
    
    
    // initialize chart legend
    var legend = svgChart.selectAll(".legend")
    .data(relValues)
    .enter()
    .append("g")
    .classed("legend", true)
    .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
    })
    
    legend.append("rect")
    .attr("x", totalWidth - margin.right)
    .attr("y", 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", function(d, i) {return color(d)});

    legend.append("text")
    .attr("class", "text")
    .attr("x", totalWidth - margin.right - 20)
    .attr("y", 27)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d, i) {
        return relNames[i]
    });

};

// function update(vacData, nld, provinces) {
//     // load and update slider
//     var slider = document.getElementById("myRange");
//     var output = document.getElementById("demo");
//     output.innerHTML = slider.value;

//     // make graph with output slider
//     slider.oninput = function() {
//     output.innerHTML = this.value;
//     createMap(vacData, nld, provinces, this.value)
//     };

//     svg.selectAll("*").remove();

    // update map
    // var map = svgMap.selectAll(".g")
    //     console.log(map)
// };