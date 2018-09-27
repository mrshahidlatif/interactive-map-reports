//-------------------------------------------------
//Global Variables
//-------------------------------------------------
var path;
var dotColor;
var lowColor;
var highColor; 

var width;
var height; 
var isCompareMode;
var selectedRegions = []; 
//-------------------------------------------------

function generateVis(canvas, config){
  //Width and height of map
  // console.log(config.geoJSONFile); 

  //Color Scheme
  switch (config.situation) {
    case "positive":
         dotColor = '#2a4fc9'
        lowColor = '#afdbc4'
        highColor = '#047c3e'
        break;
    case "negative":
         dotColor = '#000000'
         lowColor = '#ffb7b7'
         highColor = '#ff0000'
        break;
    case "neutral":
         dotColor = '#FF8000'
         lowColor = '#deebf7'
         highColor = '#3182bd'
        break;
    default:
      // statements_def
      break;
  }

  var geoJSON = config.geoJSONFile; 
  var dataFile = config.dataFile;  

  
  var margin = {top: 0, right: 0, bottom: 20, left: 0};
  width = 600 -margin.left-margin.right;
  height = 500-margin.top - margin.bottom;
  
  // D3 Projection
  if(config.geoRegion == "the United States of America"){
  var projection = d3.geoAlbersUsa()
  // var projection = d3.geoEquirectangular()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale(700); // scale things down so see entire US
  }
  else if (config.geoRegion == "the World"){
    var projection = d3.geoMercator()
    .scale(width*0.3)
    .translate([width/2, height/2])
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

  //removing previous SVG 
  d3.select("#" + canvas).selectAll("*").remove();

  //Create SVG element and append map to the SVG
  var svg = d3.select("#" + canvas)
    // .append("svg")
    .attr("width", width-margin.left-margin.right)
    .attr("height", height-margin.top - margin.bottom)
    .on("click", function(d){resetShading()})
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
    var area = d3.scaleLinear().domain([d3.min(dataArray2),d3.max(dataArray2)]).range([1,225])
    
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
                  .style("opacity", 0)
                  .style("border", "solid")
                  .style("border-width","1px");

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class","regions")
        // .attr("id",function(d){return d.properties.name;})
        .attr("d", path)
        .style("stroke", "#000")
        .style("stroke-width", "1")
        .style("fill", function(d) { 
          if (d.properties.value != undefined)
            return ramp(d.properties.value);
          else return "#bdbdbd";
        })
         //Adding mouseevents
        .on("mouseover", function(d) {
          // d3.select(this).transition().duration(300).style("opacity", 1);
          if (d.properties.value == undefined || d.properties.value2 == undefined)
          {
            div.transition().duration(300)
            .style("opacity", 1)
            div.html(d.properties.name + " : No data available!")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY -30) + "px");
          } 
          else {
            div.transition().duration(300)
            .style("opacity", 1)
            div.html(d.properties.name + "<br/>" + d.properties.value + " " + config.indVariable + " <br/> "+ d.properties.value2 + " "+ config.depVariable)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY -30) + "px");
           
          }
        })
        .on("mouseout", function() {
          // d3.select(this)
          // .transition().duration(300)
          // .style("opacity", 1);
          div.transition().duration(300)
          .style("opacity", 0);
        })
        .on("click",function(d){
          if(isCompareMode){
            selectedRegions.push(d.properties.name);
            svg.selectAll("path").style("opacity", 1);
            svg.selectAll("path").filter(function(d){
              if (d.properties.name != selectedRegions[0] && d.properties.name != selectedRegions[1] ){
                return true; 
              }
            })
              .style("opacity", .2);
            compareTwoRegions(selectedRegions[0],selectedRegions[1],ramp);
            selectedRegions.length=0;
            d3.select("#" + "map").selectAll(".infoText").remove();
            d3.select("#" + "map").selectAll(".infoIcon").remove();
            isCompareMode = false; 

          }
          else {
            svg.selectAll("path").style("opacity", 1);
            highlightRegion(d.properties.name);
            explainOnDemand(d.properties.name,config,ramp);
            selectedRegions.length=0; 
            selectedRegions.push(d.properties.name);
          }
          d3.event.stopPropagation();
        });

      // Drawing the second variable on the map
      svg.selectAll(".dots")
        .data(json.features)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r", function (d){
          return Math.sqrt(area(d.properties.value2)*2/Math.PI)
        })
        .attr("fill",dotColor)
        .attr("transform",function(d){
          var p = path.centroid(d); //<-- centroid is the center of the path, projection maps it to pixel positions
          // console.log(p);
          return "translate("+p+")";
        })
        .on("mouseover", function(d) {

          div.transition().duration(300)
          .style("opacity", 1)
          div.html(d.properties.name + "<br/>" + d.properties.value + " " + config.indVariable + " <br/> "+ d.properties.value2 + " "+ config.depVariable)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY -30) + "px");

          // d3.select(this).transition().duration(300).style("opacity", 1);
          // div.transition().duration(300)
          // .style("opacity", 1)
          // div.text(d.properties.name + " : " + d.properties.value2 + " "+ config.depVariable)
          // .style("left", (d3.event.pageX) + "px")
          // .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
          .transition().duration(300)
          .style("opacity", 1);
          div.transition().duration(300)
          .style("opacity", 0);
        });
     
      // add a legend
      var w = 150, h = 10;

      // var key = d3.select("body")
      // var key = svg
      var key = d3.select("#" + "map")
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

      key.append("text")
        .attr("class", "legend-text")
        .attr("x",width/2 - w)
        .attr("y",height-30)
        .text(config.indVariable.toProperCase());
      
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
        .attr("fill", dotColor)
        .attr("cx",width/2 + 30 +10 )
        .attr("cy",height-48)
        .attr("r",10)

      key.append("text")
        .attr("class", "legend-text")
        .attr("x",width/2 + 30 )
        .attr("y",height-30)
        .text(config.depVariable.toProperCase());

        $(".leftcolumn").css('border-style','solid');
        $(".leftcolumn").css('border-width','1px');

    });
  });

}
function resetShading(){
   var regions = d3.select("#" + "map").selectAll("path").style("opacity", 1);
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
String.prototype.capitalize = function() {
    if (this.charAt(0) == " "){
      return " " + this.charAt(1).toUpperCase() + this.slice(2);
    }
    else 
      return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.appendPostFix = function () {
  // console.log(this);
  // console.log(this.substring(this.length-2,this.length));

  if (this == "East" || this == "West" || this == "North" || this == "South" || this.substring(this.length-2,this.length)=="st")
    return this + "ern";
  else if (this.substr(this.length-1,this.length-1)=="a")
    return this + "n";
  else if (this.substr(this.length-2,this.length-1)=="pe")
    return this + "an"; 
  else return this; 
}

String.prototype.getPlural = function () {
  if (this == "state" || this == "State")
    return this + "s";
  else if(this == "country" || this == "Country"){
    return this.substring(0,this.length-1) + "ies";
  } 
}

function highlightRegion(name){
  // console.log(name);
  var regions = d3.select("#" + "map").selectAll("path").style("opacity", 1);
  var regions = d3.select("#" + "map")
    .selectAll("path").filter(function(d){return d.properties.name != name;})
    .style("opacity", .2);
  d3.select("#" + "map").selectAll(".infoText").remove();
  d3.select("#" + "map").selectAll(".infoIcon").remove();
  addCompareBtn();

}

function addCompareBtn(){
  d3.select("#" + "map")
    .append("text")
    .attr("class", "infoText")
    .attr("x",20)
    .attr("y",23)
    .text("(Click to compare two "+ config.granularity+")");

  d3.select("#" + "map")
    .append("text")
    .attr("class", "infoIcon")
    .attr("x",0)
    .attr("y",25)
    .html("&#x1F6C8;")

}