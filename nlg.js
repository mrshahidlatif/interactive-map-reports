var allData; 
//Description of variables according to their type 
var vDepDescriptor="";
var vIndDescriptor="";
var verb = "";
var corr = 0; 
//------------------------------
//Thresold parameters 
//------------------------------
var POSITIVE_CORRELATION = 0.5;
var NEGATIVE_CORRELATION = -0.5;
//-------------------------------

function generateNarrative(data,config){

	var minVal = getMin(allData, config.indVariable);
	var maxVal = getMax(allData, config.indVariable);
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor]);

	// console.log(ramp(200));
	// console.log(dotColor);
	
	//Adding title to the report
	// document.getElementById("reportTitle").innerHTML = config.depVariable.toProperCase() + " and " + config.indVariable + ", "+ config.geoRegion + " ("+ config.year+")"; 
	$("#reportTitle").html(config.title);

	//verbs 

	//Description of dependent variable according to their type 
	if (config.typeDepVariable == "casualties" || config.typeDepVariable == "incidents"){
		vDepDescriptor = " number of "
		depVerb = " " + verb_incidents[Math.floor(Math.random()*verb_incidents.length)] + " ";
	}
	else if (config.typeDepVariable == "demographic-indicator") {
		vDepDescriptor = "";
		depVerb = " " + verb_demographic_indicator[Math.floor(Math.random()*verb_demographic_indicator.length)] + " ";
	}
	else if (config.typeDepVariable == "quantitative"){
		vDepDescriptor = " number of ";
		depVerb = " " + verb_quantitative[Math.floor(Math.random()*verb_quantitative.length)] + " "; 
	}

	//Description of independent variable according to their type 
	if (config.typeIndVariable == "quantitative" ){
		vIndDescriptor = " number of ";
		indVerb = " " + verb_quantitative[Math.floor(Math.random()*verb_quantitative.length)] + " "; 
	}
	else if (config.typeIndVariable == "casualties" || config.typeIndVariable == "incidents"){
		vIndDescriptor = " number of ";
		indVerb = " " + verb_incidents[Math.floor(Math.random()*verb_incidents.length)] + " ";

	}
	else if (config.typeIndVariable == "monetary") {
		vIndDescriptor = " values of ";
		indVerb = " " + verb_monetary[Math.floor(Math.random()*verb_monetary.length)] + " ";
	}

	data.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});

	//Introductor paragraph
	var intro = "The map shows the "+ vDepDescriptor + config.depVariable ;
	intro += (config.unitIndVariable != undefined) ? " (" + config.unitDepVariable + ")" : ""; 
	intro += ", encoded as the area of the dots (";
	intro += '<svg id="inlineDot" width="20px" height="20"></svg>),'

	// intro += (config.causality== "yes") ? " caused by " : " and "; 
	intro += " and ";
	intro += (vDepDescriptor == vIndDescriptor) ? "": vIndDescriptor ;
	
	intro += config.indVariable ;
	intro += (config.unitIndVariable != undefined ) ? " (" + config.unitIndVariable + ")" : ""; 
	intro += ' <svg id="inlineLegend" width="70px" height="15"></svg>' + " across the different "+ config.granularity.getPlural() + " of "  + config.geoRegion + " during " + config.year + ".";

	$("#intro").html(intro);
	
	// rendering inline legend
	makeInlineLegend("inlineLegend", 15,70);
	makeInlineDot("inlineDot", 20,20);
	
	//Description of the focus variable
	var focusVText="";

	//Univariate Outliers
	var outliers_v2 = getDataByFlag(data,"MAXV2");
	var outliers_v1 = getDataByFlag(data, "MAXV1");

	var avg_dV = ss.mean(ListOfObjToArray(allData, config.depVariable)); 

	var minRegion = getRegionWithMinValue(allData, config.depVariable);
	var maxRegion = getRegionWithMaxValue(allData, config.depVariable);

	var regionsWithMinValues = allData.filter(function(d){ return d[config.depVariable]==getMin(allData,config.depVariable);});
	regionsWithMinValues = regionsWithMinValues.filter(function(d){return d[config.regionID] != minRegion[config.regionID];});
	
	var regionsWithMaxValues = allData.filter(function(d){ return d[config.depVariable]==getMax(allData,config.depVariable);});
	regionsWithMaxValues = regionsWithMaxValues.filter(function(d){return d[config.regionID] != maxRegion[config.regionID];});
	
	var moreRegionsWithMinValueString = "Other similar regions are " + stringifyListOfObjects(regionsWithMinValues);
	var moreRegionsWithMaxValueString = "Other similar regions are " + stringifyListOfObjects(regionsWithMaxValues);
	

	focusVText += " The average " + vDepDescriptor + config.depVariable + " per " + config.granularity + " was " + avg_dV.toLocaleString() + ", and it "; 
	focusVText += " varies from ";
	focusVText += getMin(allData, config.depVariable) == 0 ? " no instances " : getMin(allData, config.depVariable).toLocaleString();
	focusVText += " in " + '<span class="rID" style="background-color:'+ramp(getMin(allData, config.depVariable))+'">' + minRegion[config.regionID].toProperCase()+ '</span>' + " ";
	focusVText += (regionsWithMinValues.length > 1) ? '<span title="'+ moreRegionsWithMinValueString +'" class="moreInfoIcon">&#x1F6C8;</span>' : "";
	focusVText += " to " + getMax(allData, config.depVariable).toLocaleString() + " in " + '<span class="rID" style="background-color:'+ramp(getMax(allData, config.indVariable))+'">'+ maxRegion[config.regionID].toProperCase() + '</span>';
	focusVText += (regionsWithMaxValues.length > 1) ? '<span title="'+ moreRegionsWithMaxValueString +'" class="moreInfoIcon">&#x1F6C8;</span>' : "";
	focusVText += " across " + config.geoRegion +".";

	//focusVText += (config.causality=="no") ? ", whereas " + vIndDescriptor + config.indVariable +" ranges between " + getMin(allData, config.indVariable) + " and " + getMax(allData, config.indVariable)+"." : ".";
	
	console.log(outliers_v2);
	if(outliers_v2.length>0){  
		outliers_v2 = outliers_v2.filter(function(d){return d[config.regionID] != maxRegion[config.regionID];});
		if (outliers_v2.length>0) focusVText += stringifyList_v2(outliers_v2,ramp);
	}

	//Odd on out - regions showing different behavior compared to their neighbors 
	var oddRegions_lower = []; 
	var oddRegions_upper = [];

	for (var i=0;i<allData.length;i++){
		var rName = allData[i][config.regionID].toProperCase(); 
		if(rName != undefined && existNeighborsInfo){
			var neighbors = geo_neighbors[rName].split(",");
			// console.log(neighbors);
			var neighbor_objects = getObjectsByNames(allData, neighbors);
			var arrOfNeighborValues = ListOfObjToArray(neighbor_objects, config.depVariable);

			// console.log(arrOfNeighborValues); 

			var flag = isOutlierAmongNeighbors(arrOfNeighborValues, allData[i][config.depVariable]);

			if(flag=="upper") { oddRegions_upper.push(rName); }
			else if (flag=="lower"){ oddRegions_lower.push(rName); }
		}		
	}

	focusVText += describeOddRegions(oddRegions_lower, oddRegions_upper,ramp) ;
	//Spatial trend in variables
	//------------------------------------------------------------------------
	var distinctRegions = [];

	for (var i = 0; i < allData.length; i++) {
		 var id = allData[i][config.regionID].toProperCase(); 
	   if (distinctRegions.indexOf(regions[id])==-1 && regions[id] != undefined)
		  distinctRegions.push(regions[id]);
	}
  
	var regionGroups = new Array(distinctRegions.length);
  
	  for (var i = 0; i < regionGroups.length; i++) {
		regionGroups[i] = new Array();
	  }
  
	for (var i=0;i<distinctRegions.length;i++){
		 for (var j = 0; j < allData.length; j++) {
			 var id = allData[j][config.regionID].toProperCase(); 
		   if(regions[id]==distinctRegions[i]){
			   regionGroups[i].push(id); 
		   }
	   }
	}
	focusVText += generateSpatialTrendText(distinctRegions, regionGroups, config);
	//------------------------------------------------------------------------ 
	$("#focusVText").html(focusVText);

	//Paragraph describing relationship among variables 
	var rText=""; 
	if(config.causality=="yes"){ //Only print if there is causality in the variables
		corr = computeCorrelation(allData);
		// console.log(corr); 
		if(corr > POSITIVE_CORRELATION){
			rText += " Overall, there is a relationship between " + vIndDescriptor + config.indVariable + " and " + vDepDescriptor + config.depVariable;
			rText += "&mdash;higher the " + vIndDescriptor + config.indVariable + "," ;
			rText += (config.typeDepVariable=="demographic-indicator" && config.situation == "positive") ? " better is the " : " higher are the " ;
			rText += vDepDescriptor + config.depVariable + ".";
		}
		else if (corr < NEGATIVE_CORRELATION){
			rText += " Overall, there is a relationship between " + vIndDescriptor + config.indVariable + " and " + vDepDescriptor + config.depVariable;
			rText += "&mdash;higher the " + vIndDescriptor + config.indVariable + ", lower are the " + vDepDescriptor + config.depVariable + ".";
		}
	} 
	rText += generateRegionalCorrelationText(distinctRegions, regionGroups, config);

	var bivariate_outliers = getDataByFlag(data, "BOL");
	// console.log(bivariate_outliers); 
	if(bivariate_outliers.length>0){
		rText += stringifyBivariateOutliers(bivariate_outliers,ramp); 
	}

	$("#rText").html(rText);

	data.sort(function(a,b){return +b[config.indVariable] - +a[config.indVariable]});
	// console.log(data); 

	
	// if(outliers_v1.length>0){
	// 	rText += stringifyList_v1(outliers_v1);
	// }
	// else {
	// 	var minRegion = getRegionWithMinValue(allData, config.indVariable);
	// 	var maxRegion = getRegionWithMaxValue(allData, config.indVariable);
	// 	// console.log(minRegion)
	// 	text += " Similarly, "+ config.indVariable + " ranges from "+ minRegion[config.indVariable] + " (" + minRegion[config.regionID] + ") " + " to " + maxRegion[config.indVariable] + " (" + maxRegion[config.regionID] + ")." ;

	// } 
}
function describeOddRegions(l, u, ramp){
	
	var lObjects = getObjectsByNames(allData,l);
	var uObjects = getObjectsByNames(allData,u);
	// console.log(uObjects);

	var s="";
	if (l.length>0 || u.length >0){
		s += " The " + config.granularity+ " " ;
		if (u.length > 0){
			s += stringifyListOfObjectswithColorCoding(uObjects,ramp);
				s += " are different from their neighboring "+ config.granularity.getPlural() + " as they "; 
			if(config.typeDepVariable == "casualties"){
				s += " suffered a lot more casualties."; 
			}
		}
		if (l.length > 0){
			s += "The "+ config.granularity + " " + stringifyListOfObjectswithColorCoding(lObjects,ramp);
			if(config.typeDepVariable == "casualties"){
				s += " suffered a lot less casualties."; 
			}
		}
	}
	return s; 
}
function stringifyListOfObjectswithColorCoding(list,ramp){
	var s = "";
	for (var i=0;i<list.length;i++){
		if (i==list.length-1){
			// s += "and "+list[i][config.regionID];
			s += " and " + '<span class="rID" style="background-color:'+ramp(list[i][config.indVariable])+'">' + list[i][config.regionID].toProperCase()+ '</span>' ;
		}
		else {
			s+= '<span class="rID" style="background-color:'+ramp(list[i][config.indVariable])+'">' + list[i][config.regionID].toProperCase()+ '</span>'+ ", ";
		}
	}
	return s; 
}
function stringifyListOfObjects(list){
	var s = "";
	for (var i=0;i<list.length;i++){
		if (i==list.length-1){
			s+= "and "+list[i][config.regionID];
		}
		else {
			s+= list[i][config.regionID]+ ", ";
		}
	}
	return s; 
}

function stringifyBivariateOutliers(list,ramp){
	//list = list of bivariate outliers
	var s = ""; 
	console.log(list[0]);

	var olDepV = getUpperUnivariateOutliers(allData, config.depVariable);
	var olIndV = getUpperUnivariateOutliers(allData, config.indVariable);

	// console.log(olDepV);
	// console.log(olIndV);

	//Case 1 - upper outlier in both variables
	if(isExist(olDepV, list[0][config.regionID]) && isExist(olIndV, list[0][config.regionID])){
		s += " In comparison to the other " + config.granularity.getPlural() + ", ";
		s += '<span class="rID" style="background-color:'+ramp(list[0][config.indVariable])+'">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += getVerb("s","past",depVerb) + " high " + vDepDescriptor + " " +config.depVariable + " as well as high "+ vIndDescriptor + " "+ config.indVariable + "." ;
	}
	//removing the outlier that was stated - only remove if there are more that 2 bivariate outliers
	if (list.length>=2){
		list = list.filter(function(d){return d[config.regionID] != list[0][config.regionID];});
	}

	console.log(list);
	//Case 2 - outlier in dependent variable but not in independent variable
	if(isExist(olDepV, list[0][config.regionID]) && !isExist(olIndV, list[0][config.regionID])){
		s += " Despite having a relatively small "+ vIndDescriptor + " " +config.indVariable + " (" + list[0][config.indVariable]+"), ";
		s += '<span class="rID" style="background-color:'+ramp(list[0][config.indVariable])+'">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += " shows high " + vDepDescriptor + " " + config.depVariable + " (" + list[0][config.depVariable]+").";
	}
	return s; 
}
function isExist(list, element){
	var r = false; 
	for (var i=0; i<list.length;i++){
		if (list[i][config.regionID]==element)
		{
			r = true;
			break;
		}
	}
	return r; 
}
function getUpperUnivariateOutliers(data, variable){
		// Creating data arrays 
		var uniOutliers =[]; 
		var var1 = [];
		for (var i=0;i<data.length;i++){
			var1.push(+data[i][variable]);
		}

		// computing univariate outliers
		var firstQ_var1 = ss.quantile(var1, 0.25);
		var thirdQ_var1 = ss.quantile(var1, 0.75);
		var IQR_var1 = ss.interquartileRange(var1);
		for (var i=0;i<data.length;i++){
			if(+data[i][variable] > thirdQ_var1+IQR_var1){
				uniOutliers.push(data[i]); 
			}
		}
	return uniOutliers; 
}

function stringifyList_v2(list,ramp){
	//TESTED
	var string="";
	// moreRegionsString = stringifyListOfObjects(list);
	console.log(list); 
	list = getTopNItems(list, 3, 4, config.depVariable);

	switch (list.length) {
		case 1:  
			string += " Other "+ config.granularity + " showing high ";
			string += vDepDescriptor + " " + config.depVariable + " is " + '<span class="rID" style="background-color:'+ramp(list[0][config.indVariable])+'">' + list[0][config.regionID].toProperCase()+ '</span>' +" (" +list[0][config.depVariable].toLocaleString() + ")" ;
			string += (config.causality == "yes") ? " as a result of "+ list[0][config.indVariable].toLocaleString() + " " + config.indVariable+"." : ".";
			break;
		case 2:
			string += " Other "+ config.granularity.getPlural() + " showing high ";
			string += vDepDescriptor + " " + config.depVariable + " are " + '<span class="rID" style="background-color:'+ramp(list[0][config.indVariable])+'">' + list[0][config.regionID].toProperCase()+ '</span>' + " (" + list[0][config.depVariable].toLocaleString() + ")" + " and "+ '<span class="rID" style="background-color:'+ramp(list[1][config.indVariable])+'">' + list[1][config.regionID].toProperCase()+ '</span>' + " (" + list[1][config.depVariable] + ").";
			break;
		default:
			string += " Other "+ config.granularity.getPlural() + " showing high ";
			string += vDepDescriptor + config.depVariable + " are "; 
			for(i=0;i<list.length;i++){
				if(i < list.length -1)
					string += '<span class="rID" style="background-color:'+ramp(list[i][config.indVariable])+'">' + list[i][config.regionID].toProperCase()+ '</span>' + " (" +list[i][config.depVariable]+ ")" + ", ";
				else 
					string += " and " + '<span class="rID" style="background-color:'+ramp(list[i][config.indVariable])+'">' + list[i][config.regionID].toProperCase()+ '</span>' + " (" +list[i][config.depVariable]+ ")"+ ". ";
			}
			// string += '<span title="'+ moreRegionsString +'" class="moreInfoIcon">&#x1F6C8;</span>'; 
			break;
	}
	return string; 
}
function stringifyList_v1(list){
	list.sort(function(a,b){return +b[config.indVariable]- +a[config.indVariable];});
	// console.log(list)
	var string="";
	switch (list.length) {
		case 1:
			string += " Similarly, maximum number of " + config.indVariable + " (" + list[0][config.indVariable] + ") " + " are observed " + " in " + list[0][config.regionID].toProperCase() + "."; 
			break;
		case 2:
			string += " Similarly, maximum number of " + config.indVariable + " (" + list[0][config.indVariable] + ") " + " are observed " + " in " + list[0][config.regionID].toProperCase() +" followed by "+ list[1][config.regionID].toProperCase() + " (" + list[1][config.indVariable] + ").";
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
function explainOnDemand(name,config,ramp){
	var exp = ""; 
	
	document.getElementById("eod-head").innerHTML = name.toProperCase();
	var selectedRegion = allData.filter(function(d){return d[config.regionID].toLowerCase() == name.toLowerCase()});
	
	var value_dV = selectedRegion[0][config.depVariable];
	var value_iV = selectedRegion[0][config.indVariable];
	var avg_dV = getAverage(allData, config.depVariable);
	var avg_iV = getAverage(allData, config.indVariable);
	// console.log(value_iV); 

	//Based on dependant variable
	exp += '<span class="rID" style="background-color:'+ramp(value_iV)+'">' + name.toProperCase()+ '</span>'; 
	exp += getVerb("s","past",depVerb) ;


	if(value_dV == getMin(allData,config.depVariable)) {
		exp += (value_dV==0) ? "no " : "the lowest" + vDepDescriptor + " (" + value_dV+") ";
		exp += config.depVariable; 
	}
	else if(value_dV == getMax(allData,config.depVariable)) {
		exp += (value_dV==0) ? "no " : "the highest" + vDepDescriptor + " (" + value_dV+") ";
		exp += config.depVariable; 
	}
	else if(value_dV > avg_dV){
		exp += " above average (" + value_dV + ") "+ config.depVariable;
	}
	else if (value_dV < avg_dV){
		exp += " below average (" + value_dV + ") " + config.depVariable;
	}

	//Based on independant variable
	if(value_iV == getMin(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "the lowest" + vIndDescriptor + " (" + value_iV+") ";
		exp += config.indVariable; 
	}
	else if(value_iV == getMax(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "highest" + vIndDescriptor + "(" + value_iV+") ";
		exp += config.indVariable; 
	}
	else if(value_iV > avg_iV){
		exp += " and above average (" + value_iV + ") "+ config.indVariable;
	}
	else if (value_iV < avg_iV){
		exp += " and below average (" + value_iV + ") " + config.indVariable;
	}

	exp += " when compared to the other " + config.granularity.getPlural() + "."; 
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

		if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])=="upper"){
			var objs = getObjectsByNames(allData, neighbors); 

			exp += " Compared to its neighbors, ";
			exp += stringifyListOfObjectswithColorCoding(objs, ramp);
			exp +=  ", " + name.toProperCase();
			exp += getVerb("s","past", depVerb) + " more " + config.depVariable + ".";
		}
		else if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])=="lower"){
			var objs = getObjectsByNames(allData, neighbors); 
			exp += " Compared to its neighbors, ";
			exp += stringifyListOfObjectswithColorCoding(objs, ramp);
			exp += ", " + name.toProperCase();
			exp += getVerb("s","past", depVerb) ;
			exp += (config.typeDepVariable == "continuous") ? " very few " : " less "; 
			exp += config.depVariable + ".";
		}
	}

	document.getElementById("eod").innerHTML = exp;
}
function compareTwoRegions(a,b,ramp){
	var comText = "";
	document.getElementById("eod-head").innerHTML = a + " and " + b;

	var aObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == a.toLowerCase()})[0];
	var bObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == b.toLowerCase()})[0];
	// console.log(aObj);
	// console.log(bObj);
	var is_a_mentionded = false; 
	var is_b_mentionded = false; 

	if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + a + '</span>'; 
		comText += " has higher " + config.depVariable + " ("+aObj[config.depVariable]+") ";
		comText += " and higher "+ config.indVariable + " ("+aObj[config.indVariable]+") ";
		is_a_mentionded= true; 
	}
	else if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + b + '</span>'; 
		comText += " has higher " + config.depVariable + " (" + bObj[config.depVariable] + ") ";
		comText += " and higher "+ config.indVariable + " ("+bObj[config.indVariable]+") "; 
		is_b_mentionded = true;
	}
	else if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + a + '</span>'; 
		comText += " has higher " + config.depVariable + " ("+aObj[config.depVariable]+") ";
		comText += " but lower "+ config.indVariable + " ("+aObj[config.indVariable]+") "; 
		is_a_mentionded= true;
	}
	else if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + b + '</span>'; 
		comText += " has higher " + config.depVariable + " ("+bObj[config.depVariable]+") ";
		comText += " but lower "+ config.indVariable + " ("+bObj[config.indVariable]+") ";
		is_b_mentionded = true; 
	}
	if (is_a_mentionded){
		comText += " when compared to "; 
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + b + '</span>';
		comText += " (" + bObj[config.depVariable]+ " "+ config.depVariable+ ", "+ bObj[config.indVariable] +" "+config.indVariable +")."
	}
	else if (is_b_mentionded){
		comText += " when compared to ";
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + a + '</span>';
		comText += " (" + aObj[config.depVariable]+ " "+ config.depVariable+ ", "+ aObj[config.indVariable] +" "+config.indVariable +")."
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

	neighbors.push(+p);
	// console.log(neighbors);
	var firstQ = ss.quantile(neighbors, 0.25);
	var thirdQ = ss.quantile(neighbors, 0.75);
	var IQR = ss.interquartileRange(neighbors);
	// console.log(p + ": "+ (thirdQ+IQR) );
	// console.log(p + ": "+ (firstQ-IQR) );
	if(p > thirdQ+IQR){
		return "upper";
	}
	if(p < firstQ-IQR){
		return "lower"; 
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
	console.log(arr2D);
	var mDistances = mahalanobis(arr2D);
	// console.log(mDistances);
	for (var i=0;i<mDistances.length;i++){
		if(mDistances[i]>4){
			var obj= new Object() ;
			obj[config.regionID] = data[mDistances.indexOf(mDistances[i])][config.regionID];
			obj[config.indVariable] = data[mDistances.indexOf(mDistances[i])][config.indVariable];
			obj[config.depVariable] = data[mDistances.indexOf(mDistances[i])][config.depVariable];
			obj.v2_v1_ratio = obj[config.depVariable]/obj[config.indVariable];
			obj.mD = mDistances[i];
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
function generateRegionalCorrelationText(dRs,rGs, config){
	var text = "";
	// console.log(dRs);
	//Correlations among regions 
	var corr_arr = [] ; 
	for (var i=0;i<rGs.length;i++){
		var objs = getObjectsByNames(allData,rGs[i]);
		if (objs.length >2)
			corr_arr[i] = ss.sampleCorrelation(ListOfObjToArray(objs,config.depVariable), ListOfObjToArray(objs,config.indVariable));
	}
	// console.log(corr_arr);

	var pos_corr_arr = []; 
	var neg_corr_arr = [];

	 for(var i=0;i<corr_arr.length;i++){
		if(corr_arr[i] > 0.75){
			pos_corr_arr.push(i);
		}
		if(corr_arr[i] < -0.75){
			neg_corr_arr.push(i);
		}
	}
	// console.log(neg_corr_arr);
	// console.log(dRs[pos_corr_arr[0]])
	if(config.causality=="yes" && pos_corr_arr.length>0 && corr < POSITIVE_CORRELATION){
		text += " Higher "+ vDepDescriptor + config.depVariable + " are associated with higher " + vIndDescriptor + config.indVariable +" among "; 
		if(pos_corr_arr.length==1)
			text += dRs[pos_corr_arr[0]].appendPostFix() + " " +  config.granularity.getPlural() + ".";
		else if(pos_corr_arr.length==2)
			text += dRs[pos_corr_arr[0]].appendPostFix() + " and " + dRs[pos_corr_arr[1]].appendPostFix() + " " + config.granularity.getPlural() + ".";
		else {
			text = ""; 
		}	 
	}
	// console.log(neg_corr_arr);
	if(config.causality=="yes" && neg_corr_arr.length>0 && corr>NEGATIVE_CORRELATION){
		text += " Lower " + vDepDescriptor + config.depVariable + " are associated with higher "+ vIndDescriptor + config.indVariable +" among "; 
		if(neg_corr_arr.length==1)
			text += dRs[neg_corr_arr[0]].appendPostFix() + " " + config.granularity.getPlural() + ".";
		else if(neg_corr_arr.length==2)
			text += dRs[neg_corr_arr[0]].appendPostFix() + " and " + dRs[neg_corr_arr[1]] + " " + config.granularity.getPlural() + ".";
		// for(var i=0;i<neg_corr_arr.length; i++){
		// 	text += "";
		// } 
	}
	// Printes only if the overall correlation text is generated before
	if (corr > POSITIVE_CORRELATION){
		text += " This relationship is even stronger among ";
		if(pos_corr_arr.length==1)
			text += dRs[pos_corr_arr[0]].appendPostFix() + " " +  config.granularity.getPlural() + ".";
		else if(pos_corr_arr.length==2)
			text += dRs[pos_corr_arr[0]].appendPostFix() + " and " + dRs[pos_corr_arr[1]].appendPostFix() + " " + config.granularity.getPlural() + ".";
	}
	else if (corr < NEGATIVE_CORRELATION){
		text += " This relationship is even stronger among ";
		if(neg_corr_arr.length==1)
			text += dRs[neg_corr_arr[0]].appendPostFix() + " " + config.granularity.getPlural() + ".";
		else if(neg_corr_arr.length==2)
			text += dRs[neg_corr_arr[0]].appendPostFix() + " and " + dRs[neg_corr_arr[1]] + " " + config.granularity.getPlural() + ".";
	}
	return text;

}
function generateSpatialTrendText(dRs,rGs, config){
	var text = " ";

	var regionsGroupSums_dV = [] ; 
	for (var i=0;i<rGs.length;i++){
		var objs = getObjectsByNames(allData,rGs[i]);
		regionsGroupSums_dV[i] = ss.sum(ListOfObjToArray(objs,config.depVariable));
	}
	// console.log(regionsGroupSums_dV);
	if (regionsGroupSums_dV.length > 0){
		var max_d = ss.max(regionsGroupSums_dV);
		// console.log(max_d); 
		var max_d_index = regionsGroupSums_dV.indexOf(max_d);
		// console.log(max_d_index);

		switch (max_d_index) {
			case 0:
				text += dRs[0].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", depVerb)+ " higher "+ vDepDescriptor + config.depVariable ; 
				break;
			case 1:
				text += dRs[1].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", depVerb)+ " higher "+ vDepDescriptor + config.depVariable ; 
				break;
			case 2:
				text += dRs[2].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", depVerb)+ " higher "+ vDepDescriptor + config.depVariable ; 
				break;
			case 3:
				text += dRs[3].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", depVerb)+ " higher "+ vDepDescriptor + config.depVariable ; 
				break;
		}
	}
	// console.log(text);

	text +=  ", whereas ";

	var regionsGroupSums_iV = [] ; 
	for (var i=0;i<rGs.length;i++){
		var objs = getObjectsByNames(allData,rGs[i]);
		regionsGroupSums_iV[i] = ss.sum(ListOfObjToArray(objs,config.indVariable));
	}
	// console.log(regionsGroupSums_iV);

	if (regionsGroupSums_iV.length > 0){

		var max_i = ss.max(regionsGroupSums_iV);
		// console.log(max_i); 
		var max_i_index = regionsGroupSums_iV.indexOf(max_i);
		// console.log(max_i_index);

		switch (max_i_index) {
			case 0:
				text += dRs[0].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", indVerb)+ " higher " + vIndDescriptor + config.indVariable ; 
				if(max_d_index == 0){
					text = " "+ dRs[0].appendPostFix() + " " + config.granularity.getPlural() + getVerb("s","past",indVerb) + " higher " + vDepDescriptor +  config.depVariable + " and " + config.indVariable +" compared to the other "+ config.granularity.getPlural(); 
				}
				break;
			case 1:
				text += dRs[1].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", indVerb)+ " higher " + vIndDescriptor + config.indVariable ;
				if(max_d_index == 1){
					text = " "+ dRs[1].appendPostFix() + " " + config.granularity.getPlural() + getVerb("s","past",depVerb) +" higher " + vDepDescriptor + config.depVariable + " and " + config.indVariable +" compared to the other "+ config.granularity.getPlural(); 
				} 
				break;
			case 2:
				text += dRs[2].appendPostFix() + " "+ config.granularity.getPlural() + getVerb("p","past", indVerb)+ " higher " + vIndDescriptor +config.indVariable ;
				if(max_d_index == 2){
					text = " "+  dRs[2].appendPostFix() + " "+ config.granularity.getPlural() + getVerb("s","past",indVerb) + " higher " + vDepDescriptor + config.depVariable + " and " + config.indVariable +" compared to the other "+ config.granularity.getPlural(); 
				}
				break;
			case 3:
				text += dRs[3].appendPostFix() + " " + config.granularity.getPlural() + getVerb("p","past", indVerb)+ " higher " + vIndDescriptor + config.indVariable ;
				if(max_d_index == 3){
					text =  " "+ dRs[3].appendPostFix() + " "+ config.granularity.getPlural() + getVerb("s","past",indVerb) + " higher " + vDepDescriptor + config.depVariable + " and " + config.indVariable +" compared to the other "+ config.granularity; 
				}
				break;
		}
	}
	text += ".";
	return text; 
}

function getTopNItems(items, minN, maxN, variable) {
 
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
      var gap = topItems[i-1][variable] - topItems[i][variable];
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
	return verb;

}
function makeInlineLegend(canvas,h,w){
	var key = d3.select("#" + canvas)
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
			.attr("transform", "translate(0,0)");
	
}
function makeInlineDot(canvas,h,w){
	var key = d3.select("#" + canvas)
			.append("g")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");
	
			key.append("circle")
			.attr("class", "dots")
			.attr("fill", dotColor)
			.attr("cx",w/2 )
			.attr("cy",h/2)
			.attr("r",10)
}

