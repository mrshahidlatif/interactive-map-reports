//-------------------------------------------------
//Global Variables
//-------------------------------------------------
var path; 
//-------------------------------------------------

function generateVis(canvas, config){
  //Width and height of map
  // console.log(config.geoJSONFile); 

  var geoJSON = config.geoJSONFile; 
  var dataFile = config.dataFile;  

  var lowColor = '#f9f9f9'
  var highColor = '#16ad1b'
  var margin = {top: 0, right: 10, bottom: 30, left: 10};
  var width = 650 -margin.left-margin.right;
  var height = 550-margin.top - margin.bottom;
  
  // D3 Projection
  if(config.geoRegion == "the United States of America"){
  var projection = d3.geoAlbersUsa()
  // var projection = d3.geoEquirectangular()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale(800); // scale things down so see entire US
  }
  else{
    var projection = d3.geoStereographic()
    .scale(width*1.5)
    .translate([width-450, height+220])
  }

  // Define path generator
  path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

  //Getting orientation of geographic regions 
  // getOrientations(path);

  //Create SVG element and append map to the SVG
  var svg = d3.select("#" + canvas)
    // .append("svg")
    .attr("width", width-margin.left-margin.right)
    .attr("height", height-margin.top - margin.bottom)
    .call(d3.zoom().on("zoom", function () {
              svg.attr("transform", d3.event.transform)
      }))
    .append("g");

  
  // Load in my states data!
  d3.csv(dataFile, function(data) {
    var dataArray = [];
    var dataArray2 = [];
    for (var d = 0; d < data.length; d++) {
      dataArray.push(parseFloat(data[d][config.indVariable]));
      dataArray2.push(parseFloat(data[d][config.depVariable]));
    }
    var minVal = d3.min(dataArray)
    var maxVal = d3.max(dataArray)
    var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
    var radius = d3.scaleLinear().domain([d3.min(dataArray2),d3.max(dataArray2)]).range([1,15])
    
    // Load GeoJSON data and merge with states data
    d3.json(geoJSON, function(json) {
      // d3.json("geography/europe.json", function(json) {
      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {

        // Grab State Name
        var dataState = data[i][config.regionID].toProperCase();
        // console.log(dataState); 

        // Grab data value 
        var dataValue = data[i][config.indVariable];
        var dataValue2 = data[i][config.depVariable]; 

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;
          // console.log(jsonState); 

          if (dataState == jsonState) {
            // Copy the data value into the JSON
            json.features[j].properties.value = dataValue;
            json.features[j].properties.value2 = dataValue2;
            // Stop looking through the JSON
            break;
          }
        }
      }
      var div = d3.select("body").append("div")   
                  .attr("class", "tooltip")               
                  .style("opacity", 0);
      var selectedRegions = []; 

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#000")
        .style("stroke-width", "1")
        .style("fill", function(d) { return ramp(d.properties.value) })
         //Adding mouseevents
        .on("mouseover", function(d) {
          d3.select(this).transition().duration(300).style("opacity", 1);
          div.transition().duration(300)
          .style("opacity", 1)
          div.text(d.properties.name + " : " + d.properties.value + " " + config.indVariable)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
          .transition().duration(300)
          .style("opacity", 0.8);
          div.transition().duration(300)
          .style("opacity", 0);
        })
        .on("click",function(d){
          selectedRegions.push(d.properties.name); 
          explainOnDemand(d.properties.name,config);
          if(d3.event.ctrlKey){
            selectedRegions.push(d.properties.name);
            compareTwoRegions(selectedRegions[0],selectedRegions[1],config); 
            selectedRegions.length = 0; 
          }
        });

      // Drawing the second variable on the map
      svg.selectAll(".dots")
        .data(json.features)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r", function (d){
          return radius(d.properties.value2)
        })
        .attr("fill","blue")
        .attr("transform",function(d){
          var p = path.centroid(d); //<-- centroid is the center of the path, projection maps it to pixel positions
          // console.log(p);
          return "translate("+p+")";
        })
        .on("mouseover", function(d) {
          d3.select(this).transition().duration(300).style("opacity", 1);
          div.transition().duration(300)
          .style("opacity", 1)
          div.text(d.properties.name + " : " + d.properties.value2 + " "+ config.depVariable)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
          .transition().duration(300)
          .style("opacity", 0.8);
          div.transition().duration(300)
          .style("opacity", 0);
        });

  // var svg = svg.append("g")
  // svg
  //   .on("wheel.zoom",function(){
  //       var currScale = projection.scale();
  //       var newScale = currScale - 2*event.deltaY;
  //       var currTranslate = projection.translate();
  //       var coords = projection.invert([event.offsetX, event.offsetY]);
  //       projection.scale(newScale);
  //       var newPos = projection(coords);
  //       projection.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
  //       svg.selectAll("path").attr("d", path);
  //       // svg.selectAll(".dots").attr("transform", "translate(",20+")")
  //   })
  //   .call(d3.drag().on("drag", function(){
  //       var currTranslate = projection.translate();
  //       projection.translate([currTranslate[0] + d3.event.dx,
  //                             currTranslate[1] + d3.event.dy]);
  //       svg.selectAll("path").attr("d", path);
  //   }));

      
      // add a legend
      var w = 150, h = 10;

      // var key = d3.select("body")
      var key = svg
        .append("g")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend");

      var legend = key.append("defs")
        .append("g:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", highColor)
        .attr("stop-opacity", 1);
        
      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", lowColor)
        .attr("stop-opacity", 1);

      key.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate("+(width/2 - w) +","+(height-50)+")");
      
      //Adding legend values
      key.append("text")
        .attr("class", "legend-text")
        .attr("x",width/2 - w)
        .attr("y",height-50)
        .text(minVal);

      key.append("text")
      .attr("class", "legend-text")
        .attr("x",width/2 - getTextWidth(maxVal, 10,  " Segoe UI"))
        .attr("y",height-52)
        .text(maxVal);

      key.append("circle")
        .attr("class", "dots")
        .attr("cx",width/2 + 30 )
        .attr("cy",height-48)
        .attr("r",10)

      key.append("text")
        .attr("class", "legend-text")
        .attr("x",width/2 + 43 )
        .attr("y",height-44)
        .text("No. of deaths")


    });
  });
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
// https://stackoverflow.com/questions/29031659/calculate-width-of-text-before-drawing-the-text
function getTextWidth(text, fontSize, fontFace) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = fontSize + 'px ' + fontFace;
    return context.measureText(text).width;
}

//labelling the regions with North, South, East, and West 
// function getOrientations(path){
//   var geoRegionCenter; 
//   d3.json("geography/countries/USA.geo.json", function(json) {
//      for (var j = 0; j < json.features.length; j++) {
//           var stateName = json.features[j].properties.name;
//           geoRegionCenter = path.centroid(json.features[j].geometry); 
//           //console.log( stateName + " : " + path.centroid(json.features[j].geometry)); 
//         }
   
//     // console.log(geoRegionCenter); 
//     d3.json("us-states.json", function(json) {
//        for (var j = 0; j < json.features.length; j++) {
//             var stateName = json.features[j].properties.name;
//             var currentCenter = path.centroid(json.features[j].geometry); 
//             //console.log( stateName + " : " + path.centroid(json.features[j].geometry)); 
//             if(currentCenter[1]<geoRegionCenter[1]){
//               var o = new Object();
//               o["regionName"] = stateName;
//               o["orientation"] = "North"
//               geoOrientationData.push(o);
//               // console.log( stateName + " : " + "North"); 
//             }
//             else {
//               var o = new Object();
//               o["regionName"] = stateName;
//               o["orientation"] = "South"
//               geoOrientationData.push(o);
//               // console.log( stateName + " : " + "South");
//             }
//             if(currentCenter[0]<geoRegionCenter[0]){
//                 var o = new Object();
//               o["regionName"] = stateName;
//               o["orientation"] = "West"
//               geoOrientationData.push(o);
//               // console.log( stateName + " : " + "West"); 
//             }
//             else {
//               var o = new Object();
//               o["regionName"] = stateName;
//               o["orientation"] = "East"
//               geoOrientationData.push(o);
              
//             }
//           }
//     });
//   });
// }