var allData; 
var existNeighborsInfo = true;
//Description of variables according to their type 
var vDepDescriptor="";
var vIndDescriptor="";
var verb = ""; 
//------------------------------
//Thresold parameters 
//------------------------------
var POSITIVE_CORRELATION = 0.4;
var NEGATIVE_CORRELATION = -0.5;
//-------------------------------

function generateNarrative(data,config){

	// console.log(allData);
	// console.log(config);
	// console.log(geoOrientationData);

	//verbs 
	verb = "experience";

	//Description of variables according to their type 
	if (config.typeDepVariable == "continuous"){
		vDepDescriptor = " number of "
	}
	else if (config.typeDepVariable == "discrete") {
		vDepDescriptor = " values of "
	}

	if (config.typeIndVariable == "continuous"){
		vIndDescriptor = " number of "
	}
	else if (config.typeIndVariable == "discrete") {
		vIndDescriptor = " values of "
	}
	

	var text="";
	data.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});

	//First Sentence
	text += "Figure shows variation in "+ vDepDescriptor + config.depVariable ; 

	text += (config.causality== "yes") ? " caused by " : " and "; 
	text += config.indVariable + " across different "+ config.granularity + " of "  + config.geoRegion + " during " + config.year + ".";

	if(config.causality=="yes"){ //Only print if there is causality in the variables
		var corr = computeCorrelation(allData);
		// console.log(corr); 
		if(corr > POSITIVE_CORRELATION){
			text += " Overall, large "+ vIndDescriptor + config.indVariable + " are assoicated with large " + vDepDescriptor + config.depVariable+ ".";
		}
		else if (corr < NEGATIVE_CORRELATION){
			text += " Overall, large "+ vIndDescriptor + config.indVariable + " are assoicated with small " + vDepDescriptor + config.depVariable+ ".";

		}
	}
	
	//Univariate Outliers
	var outliers_v2 = getDataByFlag(data,"MAXV2");
	var outliers_v1 = getDataByFlag(data, "MAXV1"); 

	//print only if there are ouliers. 
	if (outliers_v2.length>0 && outliers_v1.length>0){
		text += vDepDescriptor.capitalize() + config.depVariable + " vary from "+ getMin(allData, config.depVariable) + " to " + getMax(allData, config.depVariable) + " across various " + config.granularity;
		text += (config.causality=="no") ? ", whereas " + vIndDescriptor + config.indVariable +" ranges between " + getMin(allData, config.indVariable) + " and " + getMax(allData, config.indVariable)+"." : ".";
	}

	
	// console.log(outliers_v2);
	if(outliers_v2.length>0){
		text += stringifyList_v2(outliers_v2);
	}
	else {
		
		var minRegion = getRegionWithMinValue(allData, config.depVariable);
		var maxRegion = getRegionWithMaxValue(allData, config.depVariable);
		// console.log(minRegion)
		text += " "+ config.depVariable.toProperCase() + " vary from "+ minRegion[config.depVariable] + " (" + minRegion[config.regionID] + ") " + " to " + maxRegion[config.depVariable] + " (" + maxRegion[config.regionID] + ") " + " across various " + config.granularity + " of " + config.geoRegion + ".";
	}

	data.sort(function(a,b){return +b[config.indVariable] - +a[config.indVariable]});
	// console.log(data); 

	
	if(outliers_v1.length>0){
		text += stringifyList_v1(outliers_v1);
	}
	else {
		var minRegion = getRegionWithMinValue(allData, config.indVariable);
		var maxRegion = getRegionWithMaxValue(allData, config.indVariable);
		// console.log(minRegion)
		text += " Similarly, "+ config.indVariable + " ranges from "+ minRegion[config.indVariable] + " (" + minRegion[config.regionID] + ") " + " to " + maxRegion[config.indVariable] + " (" + maxRegion[config.regionID] + ")." //+ " across various " + config.granularity + " of " + config.geoRegion + ".";

	}

	var bivariate_outliers = getDataByFlag(data, "BOL");
	// console.log(bivariate_outliers); 
	if(bivariate_outliers.length>0){
		text += stringifyBivariateOutliers(bivariate_outliers); 
	}

	//Spatial trend in variables
	computeSpatialTrends(allData,config); 

	return text; 
}

function stringifyBivariateOutliers(list){
	var string = ""; 
	var max_ratio = getMax(list, "v2_v1_ratio");
	// console.log(max_ratio);
	switch (list.length) {
		case 1:
			string += " Quite unusual behavior can be observed in " + list[0][config.regionID].toProperCase() +"."; 
			break;
		case 2:
			string += " Quite unusual behavior can be observed in " + list[0][config.regionID].toProperCase() +" and " + list[1][config.regionID].toProperCase()+"."; 
			break;
		default:
			string += " Quite unusual behavior can be observed in ";
			for(var i=0;i<list.length;i++){
				if (i==list.length-1){
					string+= "and "+list[i][config.regionID].toProperCase()+".";
				}
				else {
					string+= list[i][config.regionID].toProperCase() + ", ";
				}
			}
			break;
	}

	var bo = list.filter(function(d){return d.v2_v1_ratio == max_ratio});
	// console.log(bo);
	if(config.causality=="yes"){
		if(bo.length == 1){
			string += " In particular, relatively small "+ vIndDescriptor + config.indVariable + " (" + bo[0][config.indVariable]+")" ; 
			string += " caused very high number of " + config.depVariable + " (" +bo[0][config.depVariable]+") in " + bo[0][config.regionID].toProperCase()+".";
		}
	}
	else {
		if(bo.length == 1){
			string += " In particular, " + bo[0][config.regionID].toProperCase() + " shows relatively small "+ vIndDescriptor + config.indVariable + " (" + bo[0][config.indVariable]+")" ; 
			string += " and a very high number of " + config.depVariable + " (" +bo[0][config.depVariable]+").";
		}
	}
	return string; 
}
function stringifyList_v2(list){
	//TESTED
	var string="";
	switch (list.length) {
		case 1:  
			string += string += (config.situation=="negative") ? " Alarmingly high": "The highest";
			string += vDepDescriptor + " " + config.depVariable + " (" +list[0][config.depVariable] + ") " + " are recorded in " + list[0][config.regionID].toProperCase();
			string += (config.causality == "yes") ? " as a result of "+ list[0][config.depVariable] + " " + config.indVariable+"." : ".";
			break;
		case 2:
			string += " " + list[0][config.regionID].toProperCase() + getVerb("s", "past", verb);
			string += (config.situation=="negative") ? " alarmingly high": "the highest";
			string += vDepDescriptor + config.depVariable + " (" +list[0][config.depVariable] + ")" ;
			string += (config.causality == "yes") ? " as a result of "+ list[0][config.indVariable] + " " + config.indVariable + " followed by " : " followed by "; 
			string += (config.causality == "yes") ? list[1][config.regionID].toProperCase() + " where "+ list[1][config.indVariable]+ " "+ config.indVariable + " caused " + list[1][config.depVariable]+ " " + config.depVariable+ "." : list[1][config.regionID].toProperCase() + " (" +list[1][config.depVariable]+ ").";
			break;
		default:
			string += " " + list[0][config.regionID].toProperCase() + getVerb("s", "past", verb);
			string += (config.situation=="negative") ? " alarmingly high": "the highest";
			string += vDepDescriptor + config.depVariable + " (" +list[0][config.depVariable] + ") followed by ";
			for(i=1;i<list.length;i++){
				if(i < list.length -1)
					string += list[i][config.regionID].toProperCase() + " (" +list[i][config.depVariable]+ ")" + ", ";
				else 
					string += " and " +list[i][config.regionID].toProperCase() + " (" +list[i][config.depVariable]+ ")"+ ". ";
			}
			break;
}
	return string; 
}
function stringifyList_v1(list){
	var string="";
	switch (list.length) {
		case 1:
			string += " Similarly, maximum number of " + config.indVariable + " (" + list[0][config.indVariable] + ") " + " are observed " + " in " + list[0][config.regionID].toProperCase() + "."; 
			break;
		case 2:
			string += " Similarly, maximum number of " + config.indVariable + " (" + list[0][config.indVariable] + ") " + " are observed " + " in " + list[0][config.regionID].toProperCase() +" followed by "+ list[1][config.regionID].toProperCase() + " (" + list[0][config.indVariable] + ") ";
			break;
		default:
			string += " Similarly, maximum number of " + config.indVariable + " (" + list[0][config.indVariable] + ") " + " are observed " + " in " + list[0][config.regionID].toProperCase() +" followed by ";
			for(i=1;i<list.length;i++){
				if(i < list.length -1)
					string += list[i][config.regionID].toProperCase() + " (" +list[i][config.indVariable]+ ")" + ", ";
				else 
					string += " and " +list[i][config.regionID].toProperCase() + " (" +list[i][config.indVariable]+ ")"+ ". ";
			}
			break;
}
	return string; 
}

function getDataByFlag(data,flag){
	return  data.filter(function(d){return d.flag == flag});
}
function explainOnDemand(name,config){
	var exp = ""; 
	
	document.getElementById("eod-head").innerHTML = name.toProperCase();
	var selectedRegion = allData.filter(function(d){return d[config.regionID].toLowerCase() == name.toLowerCase()});
	
	var value_dV = selectedRegion[0][config.depVariable];
	var value_iV = selectedRegion[0][config.indVariable];
	var avg_dV = getAverage(allData, config.depVariable);
	var avg_iV = getAverage(allData, config.indVariable);
	// console.log(value_iV); 

	//Based on dependant variable
	if(value_dV == getMin(allData,config.depVariable)) {
		exp += name.toProperCase() + " has " ;
		exp += (value_dV==0) ? "no " : "the least number of (" + value_dV+") ";
		exp += config.depVariable; 
	}
	else if(value_dV == getMax(allData,config.depVariable)) {
		exp += name.toProperCase() + " has " ;
		exp += (value_dV==0) ? "no " : "the most number of (" + value_dV+") ";
		exp += config.depVariable; 
	}
	else if(value_dV > avg_dV){
		exp += name.toProperCase() + " has above average number of (" + value_dV + ") "+ config.depVariable;
	}
	else if (value_dV < avg_dV){
		exp += name.toProperCase() + " has below average number of (" + value_dV + ") " + config.depVariable;
	}

	//Based on independant variable
	if(value_iV == getMin(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "the least number of (" + value_iV+") ";
		exp += config.indVariable; 
	}
	else if(value_iV == getMax(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "the most number of (" + value_iV+") ";
		exp += config.indVariable; 
	}
	else if(value_iV > avg_iV){
		exp += " and above average number of (" + value_iV + ") "+ config.indVariable;
	}
	else if (value_iV < avg_iV){
		exp += " and below average number of (" + value_iV + ") " + config.indVariable;
	}

	exp += " when compared to the whole of " + config.geoRegion + "."; 
	// console.log(selectedRegion);
	allData.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});
	var rank = allData.findIndex(x => x[config.regionID].toLowerCase() == name.toLowerCase()) +1; 
	exp += " It ranks " + toOrdinal(rank) + " among all regions w.r.t "+ config.depVariable + "."; 

	if(existNeighborsInfo){
		var neighbors = geo_neighbors[name.toProperCase()].split(",");
		// console.log(neighbors);
		var neighbor_objects = getObjectsByNames(allData, neighbors);
		var arrOfNeighborValues = ListOfObjToArray(neighbor_objects, [config.depVariable]);

		// console.log(arrOfNeighborValues); 

		if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])){
			exp += " Compared to it's neighbors, " +stringifyArray(neighbors) + ", " + name.toProperCase() + " shows more " + config.depVariable + ".";

		}
	}


	document.getElementById("eod").innerHTML = exp;
}
function compareTwoRegions(a,b){
	var comText = "";
	document.getElementById("eod-head").innerHTML = a + " and " + b;

	var aObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == a.toLowerCase()})[0];
	var bObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == b.toLowerCase()})[0];
	// console.log(aObj);
	// console.log(bObj);
	var is_a_mentionded = false; 
	var is_b_mentionded = false; 

	if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += a + " has higher " + config.depVariable + " ("+aObj[config.depVariable]+") ";
		comText += " and higher "+ config.indVariable + " ("+aObj[config.indVariable]+") ";
		is_a_mentionded= true; 
	}
	if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += b + " has higher " + config.depVariable + " ("+bObj[config.depVariable]+") ";
		comText += " and higher "+ config.indVariable + " ("+bObj[config.indVariable]+") "; 
		is_b_mentionded = true;
	}
	if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += a + " has higher " + config.depVariable + " ("+aObj[config.depVariable]+") ";
		comText += " but lower "+ config.indVariable + " ("+aObj[config.indVariable]+") "; 
		is_a_mentionded= true;
	}
	if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += b + " has higher " + config.depVariable + " ("+bObj[config.depVariable]+") ";
		comText += " but lower "+ config.indVariable + " ("+bObj[config.indVariable]+") ";
		is_b_mentionded = true; 
	}
	if (is_a_mentionded){
		comText += " when compared to " + b + " (" + bObj[config.depVariable]+ " "+ config.depVariable+ ", "+ bObj[config.indVariable] +" "+config.indVariable +")."
	}
	if (is_b_mentionded){
		comText += " when compared to " + a + " (" + aObj[config.depVariable]+ " "+ config.depVariable+ ", "+ aObj[config.indVariable] +" "+config.indVariable +")."
	}
	document.getElementById("eod").innerHTML = comText; 
	is_a_mentionded = false; 
	is_b_mentionded = false; 
}
function stringifyArray(arr){
	var s = "";
	for (var i=0;i<arr.length;i++){
		if (i==arr.length-1){
			s+= "and "+arr[i];
		}
		else {
			s+= arr[i]+ ", ";
		}
	}
	return s; 
}
function ListOfObjToArray(list, column){
	var arr = [];
	for (var i=0;i<list.length;i++){
		arr.push(+list[i][column]);
	}
	return arr; 
}
function isOutlierAmongNeighbors(neighbors, p){

	neighbors.push(p);
	var firstQ = ss.quantile(neighbors, 0.25);
	var thirdQ = ss.quantile(neighbors, 0.75);
	var IQR = ss.interquartileRange(neighbors);
	// console.log(p + ": "+ (thirdQ+IQR) );
	// console.log(p + ": "+ (firstQ-IQR) );
	if(p > thirdQ+IQR){
		return true;
	}
	if(p < firstQ-IQR){
		return true; 
	}

}
function getObjectsByNames(data, names){

	var objects = []; 
	for(var i=0;i<names.length;i++){
		for(var j=0;j<data.length;j++){
			if(data[j][config.regionID].toProperCase() == names[i]){
				objects.push(data[j]);
			}
		}
	}
	return objects; 

}
 function toOrdinal(i){
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
function getMin(data, variable){
	return d3.min(data, function(d){return +d[variable];});

}
function getMax(data, variable){
	return d3.max(data, function(d){return +d[variable];});
}

function getRegionWithMinValue(data, variable){
	var min = d3.min(data, function(d){return +d[variable];});
	return data.filter(function(d){return d[variable] == min})[0];

}

function getRegionWithMaxValue(data, variable){
	var max =  d3.max(data, function(d){return +d[variable];});
	return data.filter(function(d){return d[variable] == max})[0];

}
function getAverage(data, variable){
	var arr= [];
	for (var i=0;i<data.length;i++){
		arr.push(+data[i][variable]);
	}
	avg = ss.mean(arr);

	return avg; 
}

function computeCorrelation(data){
	var var1 = [];
	var var2 = [];
	for (var i=0;i<data.length;i++){
		var1.push(+data[i][config.indVariable]);
		var2.push(+data[i][config.depVariable]);
	}
	//Sample Correlation 
	corr = ss.sampleCorrelation(var1,var2);

	return corr; 
}

function analyse(data, config){
	// console.log(data);
	allData=data; 
	var selectedData = []; 
	// Creating data arrays 
	var var1 = [];
	var var2 = [];
	for (var i=0;i<data.length;i++){
		var1.push(+data[i][config.indVariable]);
		var2.push(+data[i][config.depVariable]);
	}
	//Sample Correlation 
	corr = ss.sampleCorrelation(var1,var2);
	// console.log(corr);

	// console.log(var1);
	// console.log(var2);
	// computing univariate outliers
	var firstQ_var1 = ss.quantile(var1, 0.25);
	var thirdQ_var1 = ss.quantile(var1, 0.75);
	var IQR_var1 = ss.interquartileRange(var1);
	// console.log(firstQ_var1 + ": " + thirdQ_var1+ " : "+ IQR_var1);

	var firstQ_var2 = ss.quantile(var2, 0.25);
	var thirdQ_var2 = ss.quantile(var2, 0.75);
	var IQR_var2 = ss.interquartileRange(var2);
	// console.log(firstQ_var2 + ": " + thirdQ_var2+ " : "+ IQR_var2);

	//****************************************************************
	//Flags: MAX_VAR1 (extreme value in variable 1)
	//		 MAX_VAR2 (extreme value in variable 2)
	//		 OUL (Bivariate Outlier)
	//****************************************************************

	for (var i=0;i<data.length;i++){
		if(+data[i][config.indVariable] > thirdQ_var1+IQR_var1){
			var obj= new Object() ;
			obj[config.regionID] = data[i][config.regionID];
			obj[config.indVariable] = data[i][config.indVariable];
			obj[config.depVariable] = data[i][config.depVariable];
			obj.flag = "MAXV1"
			selectedData.push(obj); 
		}
		if(+data[i][config.depVariable] > thirdQ_var2+IQR_var2){
			var obj= new Object() ;
			obj[config.regionID] = data[i][config.regionID];
			obj[config.indVariable] = data[i][config.indVariable];
			obj[config.depVariable] = data[i][config.depVariable];
			obj.flag = "MAXV2"
			selectedData.push(obj); 
		}
	}
	// console.log(selectedData); 
	//Detecing biariate outliers
	//preparing data for mohalanobis distances 
	var arr2D = Create2DArray(data.length);
	for (var i=0;i<data.length;i++){
		arr2D[i][0] = +data[i][config.indVariable];
		arr2D[i][1] = +data[i][config.depVariable];
	}
	// console.log(arr2D);
	var mDistances = mahalanobis(arr2D);

	for (var i=0;i<mDistances.length;i++){
		if(mDistances[i]>3){
			var obj= new Object() ;
			obj[config.regionID] = data[mDistances.indexOf(mDistances[i])][config.regionID];
			obj[config.indVariable] = data[mDistances.indexOf(mDistances[i])][config.indVariable];
			obj[config.depVariable] = data[mDistances.indexOf(mDistances[i])][config.depVariable];
			obj.v2_v1_ratio = obj[config.depVariable]/obj[config.indVariable]; 
			obj.flag = "BOL";
			selectedData.push(obj);
		}
	}
	// mDistances.sort(function(a,b){return b - a});
	// console.log(mDistances);
	// console.log(ss.max(mDistances))
	// console.log(selectedData);

	return selectedData;
}
// https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
function Create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}
function computeSpatialTrends(data,config){
  var text="";
  var geoOrientationData=[];
  var easternRegions = [];
  var westernRegions = [];
  var southernRegions = [];
  var northernRegions = [];

  //Computing the orientations of geographical regions 
  var geoRegionCenter; 
  d3.json(config.geoJSONRegion, function(json) {
     for (var j = 0; j < json.features.length; j++) {
          var stateName = json.features[j].properties.name;
          geoRegionCenter = path.centroid(json.features[j].geometry); 
          //console.log( stateName + " : " + path.centroid(json.features[j].geometry)); 
        }
   
    // console.log(geoRegionCenter); 
    d3.json(config.geoJSONFile, function(json) {
       for (var j = 0; j < json.features.length; j++) {
            var stateName = json.features[j].properties.name;
            var currentCenter = path.centroid(json.features[j].geometry); 
            //console.log( stateName + " : " + path.centroid(json.features[j].geometry)); 
            if(currentCenter[1]<geoRegionCenter[1]){
              var o = new Object();
              o["regionName"] = stateName;
              o["orientation"] = "North"
              geoOrientationData.push(o);
              // console.log( stateName + " : " + "North"); 
            }
            else {
              var o = new Object();
              o["regionName"] = stateName;
              o["orientation"] = "South"
              geoOrientationData.push(o);
              // console.log( stateName + " : " + "South");
            }
            if(currentCenter[0]<geoRegionCenter[0]){
                var o = new Object();
              o["regionName"] = stateName;
              o["orientation"] = "West"
              geoOrientationData.push(o);
              // console.log( stateName + " : " + "West"); 
            }
            else {
              var o = new Object();
              o["regionName"] = stateName;
              o["orientation"] = "East"
              geoOrientationData.push(o);
              
            }
          }

		for(var i=0;i<data.length;i++){
			for(var j=0;j<geoOrientationData.length;j++){
				if(data[i][config.regionID].toProperCase() == geoOrientationData[j].regionName && geoOrientationData[j].orientation == "East"){
					easternRegions.push(data[i]); 
				}
				if(data[i][config.regionID].toProperCase() == geoOrientationData[j].regionName && geoOrientationData[j].orientation == "West"){
					westernRegions.push(data[i]); 
				}
				if(data[i][config.regionID].toProperCase() == geoOrientationData[j].regionName && geoOrientationData[j].orientation == "North"){
					northernRegions.push(data[i]); 
				}
				if(data[i][config.regionID].toProperCase() == geoOrientationData[j].regionName && geoOrientationData[j].orientation == "South"){
					southernRegions.push(data[i]); 
				}
			}
		}
		 text += generateSpatialTrendText(easternRegions,westernRegions,northernRegions,southernRegions, config);
		 document.getElementById("strend").innerHTML = text ; 
		 
    });
  });
 
} 
function generateSpatialTrendText(e,w,n,s,config){
	var text = "";

	var eda = ListOfObjToArray(e,config.depVariable);
	var wda = ListOfObjToArray(w,config.depVariable);
	var nda = ListOfObjToArray(n,config.depVariable);
	var sda = ListOfObjToArray(s,config.depVariable);
	var ewns_arr = [ss.sum(eda),ss.sum(wda),ss.sum(nda),ss.sum(sda)]; 
	var max_d = ss.max(ewns_arr);
	// console.log(max_d); 
	var max_d_index = ewns_arr.indexOf(max_d);
	// console.log(max_d_index);

	switch (max_d_index) {
		case 0:
			text += " Eastern "+ config.granularity + " show more " +  + config.depVariable ; 
			break;
		case 1:
			text += " Western "+ config.granularity + " show more " + config.depVariable ; 
			break;
		case 2:
			text += " Northern "+ config.granularity + " show more " + config.depVariable ; 
			break;
		case 3:
			text += " Southern "+ config.granularity + " show more " + config.depVariable ; 
			break;
	}
	// console.log(text);

	text +=  ", whereas ";

	var eia = ListOfObjToArray(e,config.indVariable);
	var wia = ListOfObjToArray(w,config.indVariable);
	var nia = ListOfObjToArray(n,config.indVariable);
	var sia = ListOfObjToArray(s,config.indVariable);
	var ewns_i_arr = [ss.sum(eia),ss.sum(wia),ss.sum(nia),ss.sum(sia)]; 
	var max_i = ss.max(ewns_i_arr);
	// console.log(ewns_i_arr); 
	var max_i_index = ewns_i_arr.indexOf(max_i);
	// console.log(max_i_index); 

	switch (max_i_index) {
		case 0:
			text += " Eastern "+ config.granularity + " show more " + config.indVariable ; 
			if(max_d_index == 0){
				text = " Eastern "+ config.granularity + " show higher " + config.depVariable + " and " + config.indVariable +" compared to the rest of the "+ config.granularity; 
			}
			break;
		case 1:
			text += " Western "+ config.granularity + " show more " + config.indVariable ;
			if(max_d_index == 1){
				text = " Western "+ config.granularity + " show higher " + config.depVariable + " and " + config.indVariable +" compared to the rest of the "+ config.granularity; 
			} 
			break;
		case 2:
			text += " Northern "+ config.granularity + " show more " + config.indVariable ;
			if(max_d_index == 2){
				text = " Northern "+ config.granularity + " show higher " + config.depVariable + " and " + config.indVariable +" compared to the rest of the "+ config.granularity; 
			}
			break;
		case 3:
			text += " Southern "+ config.granularity + " show more " + config.indVariable ;
			if(max_d_index == 3){
				text = " Southern "+ config.granularity + " show higher " + config.depVariable + " and " + config.indVariable +" compared to the rest of the "+ config.granularity; 
			}
			break;
	}
	text += ".";

	//Correlations among regions 
	var corr_e = ss.sampleCorrelation(eda, eia);
	var corr_w = ss.sampleCorrelation(wda, wia);
	var corr_n = ss.sampleCorrelation(nda, nia);
	var corr_s = ss.sampleCorrelation(sda, sia);
	var corr_arr = [corr_e, corr_w, corr_n, corr_s]; 
	var pos_corr_arr = []; 
	var neg_corr_arr = [];

	 for(var i=0;i<corr_arr.length;i++){
		if(corr_arr[i] > POSITIVE_CORRELATION){
			pos_corr_arr.push(i);
		}
		if(corr_arr[i] < NEGATIVE_CORRELATION){
			neg_corr_arr.push(i);
		}
	}
	console.log(pos_corr_arr);
	var directions = ["Eastern", "Western", "Northern", "Southern"];
	if(pos_corr_arr.length>0){
		text += " Strong positive correlation is seen between " + config.depVariable + " and "+ config.indVariable +" among "; 
		if(pos_corr_arr.length==1)
			text += directions[pos_corr_arr[0]] + config.granularity;
		else if(pos_corr_arr.length==2)
			text += directions[pos_corr_arr[0]] + " and " + directions[pos_corr_arr[1]] + " " + config.granularity;
		for(var i=0;i<pos_corr_arr.length; i++){
			if (i==pos_corr_arr.length-1){
				text+= "and "+directions[pos_corr_arr[i]] + " "+ config.granularity;
			}
			else {
				text+= directions[pos_corr_arr[i]]+ ", ";
			}
		}
		 
	}

	if(neg_corr_arr.length>0){
		text += " Negative correlation is seen between " + config.depVariable + " and "+ config.indVariable +" among "; 
		if(neg_corr_arr.length==1)
			text += directions[pos_corr_arr[0]] + config.granularity;
		else if(neg_corr_arr.length==2)
			text += directions[neg_corr_arr[0]] + " and " + directions[neg_corr_arr[1]] + " " + config.granularity;
		for(var i=0;i<neg_corr_arr.length; i++){
			text += "";
		} 
	}
	return text + "."; 
}

function getTopNItems(items, minN, maxN) {
 
  //Given [minN, maxN] range: returns the authors in that range by systematically cutting off the list
  //For instance, check for Fabian Beck, Thomas Ertl, Daniel A. Keim to see its effect
  var topItems = [];
  var finaltopItems=[];

  items.sort(function(a, b) {
    return b.Value - a.Value;
  });
  // console.log(items);
  if (maxN < items.length){
    for (var i = 0; i <= maxN; i++) {
        topItems.push(items[i]);

    }   
  }
  else {
    topItems = items;
  }

  if (topItems.length > minN){
    // console.log(topItems);
    var gaps = [];
    for(var i=minN;i<topItems.length;i++){
      var gap = topItems[i-1].Value - topItems[i].Value;
      gaps.push(gap);
    }
    // console.log(gaps);
    var maxGap = d3.max(gaps);
    var cutPoint = gaps.indexOf(maxGap) + minN ; // adding 1 due to 0-indexing system 
    // console.log(cutPoint);
    
    for (var i=0;i<cutPoint;i++){
      finaltopItems.push(topItems[i]);
    }
  }
  else {
    finaltopItems = topItems;
  }
  // console.log(finaltopItems); 

  return finaltopItems;
}
function getVerb(sub, time, verb){
	//sub = s, p, 
	// time = present, past, 

	return " " + verb + "d "; 

}
