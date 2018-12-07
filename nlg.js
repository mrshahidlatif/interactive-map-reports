var allData; 
//Description of variables according to their type 
var vDepDescriptor="";
var vIndDescriptor="";
var verb = "";
var corr = 0; 
var infoDifferentFromNeighboringRegions;
var inlineDots=[];
var inlineDotsEOD=[];
var W=30;
var H=30; 
//------------------------------
//Thresold parameters 
//------------------------------
var POSITIVE_CORRELATION = 0.5;
var NEGATIVE_CORRELATION = -0.5;
//-------------------------------

function generateNarrative(data,config){

	var minVal = getMin(allData, config.indVariable);
	var maxVal = getMax(allData, config.indVariable);

	var mindepVal = getMin(allData, config.depVariable);
	var maxdepVal = getMax(allData, config.depVariable);


	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor]);
	var area = d3.scaleLinear().domain([mindepVal,maxdepVal]).range([1,225]);

	//Clearing the already created small dots 
	inlineDots.length=0; 
	
	// Deactivating the coloring for state names 
	// var ramp = d3.scaleLinear().domain([minVal,maxVal]).range(['#ffffff','#ffffff']);

	// console.log(ramp(200));
	// console.log(dotColor);
	
	//Additional descriptions for the info icons 
	infoDifferentFromNeighboringRegions = "The identification of such " + config.granularity.getPlural() + " depends on the fact that they are outliers among their neighbors."
	
	//Adding title to the report
	// document.getElementById("reportTitle").innerHTML = config.depVariable.toProperCase() + " and " + config.indVariable + ", "+ config.geoRegion + " ("+ config.year+")"; 
	$("#reportTitle").html(config.title);

	//verbs 

	//Description of dependent variable according to their type 
	if (config.typeDepVariable == "casualties" || config.typeDepVariable == "incidents"){
		vDepDescriptor = " number of "
		depVerb = " " + verb_incidents[Math.floor(Math.random()*verb_incidents.length)] + " ";
		vDepUnit = config.unitDepSymbol;
	}
	else if (config.typeDepVariable == "demographic-indicator") {
		vDepDescriptor = "";
		depVerb = " " + verb_demographic_indicator[Math.floor(Math.random()*verb_demographic_indicator.length)] + " ";
		vDepUnit = config.unitDepSymbol;
	}
	else if (config.typeDepVariable == "quantitative"){
		vDepDescriptor = " number of ";
		depVerb = " " + verb_quantitative[Math.floor(Math.random()*verb_quantitative.length)] + " "; 
		vDepUnit = config.unitDepSymbol;
	}
	else if (config.typeDepVariable == "uncountable"){
		vDepDescriptor = " ";
		depVerb = " " + verb_uncountable[Math.floor(Math.random()*verb_uncountable.length)] + " "; 
		vDepUnit = config.unitDepSymbol;
	}
	else if (config.typeDepVariable == "percentage"){
		vDepDescriptor = " percentage of ";
		depVerb = " " + verb_uncountable[Math.floor(Math.random()*verb_uncountable.length)] + " "; 
		vDepUnit = config.unitDepSymbol;
	
	}

	//Description of independent variable according to their type 
	if (config.typeIndVariable == "quantitative" ){
		vIndDescriptor = " number of ";
		indVerb = " " + verb_quantitative[Math.floor(Math.random()*verb_quantitative.length)] + " "; 
		vIndUnit = config.unitIndSymbol;
	}
	else if (config.typeIndVariable == "casualties" || config.typeIndVariable == "incidents"){
		vIndDescriptor = " number of ";
		indVerb = " " + verb_incidents[Math.floor(Math.random()*verb_incidents.length)] + " ";
		vIndUnit = config.unitIndSymbol;

	}
	else if (config.typeIndVariable == "monetary") {
		vIndDescriptor = " ";
		indVerb = " " + verb_monetary[Math.floor(Math.random()*verb_monetary.length)] + " ";
		vIndUnit = config.unitIndSymbol;
	}
	else if (config.typeIndVariable == "uncountable") {
		vIndDescriptor = " ";
		indVerb = " " + verb_uncountable[Math.floor(Math.random()*verb_uncountable.length)] + " ";
		vIndUnit = config.unitIndSymbol;
	}
	else if (config.typeIndVariable == "percentage") {
		vIndDescriptor = " percentage of ";
		indVerb = " " + verb_uncountable[Math.floor(Math.random()*verb_uncountable.length)] + " ";
		vIndUnit = config.unitIndSymbol;
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
	

	focusVText += " The average " + vDepDescriptor + config.depVariable + " per " + config.granularity + " was " + avg_dV.toLocaleString() + '<svg width="'+ W +'"height="'+ H + '" id="avg"></svg>' + ", and it " ; 
	focusVText += " varies from ";
	focusVText += getMin(allData, config.depVariable) == 0 ? " no instances " : getMin(allData, config.depVariable).toLocaleString() + '<svg width="'+ W +'"height="'+ H + '" id="min"></svg>';
	focusVText += (regionsWithMinValues.length > 1) ? ", for example, ":"";
	focusVText += " in " + '<span class="rID">' + minRegion[config.regionID].toProperCase()+ '</span>' + " ";
	focusVText += (regionsWithMinValues.length > 1) ? '<span title="'+ moreRegionsWithMinValueString +'" class="moreInfoIcon">&#x1F6C8;</span>' : "";
	focusVText += " to " + getMax(allData, config.depVariable).toLocaleString() + '<svg width="'+ W +'"height="'+ H + '" id="max"></svg>' +  " in " + '<span class="rID">'+ maxRegion[config.regionID].toProperCase() + '</span>';
	focusVText += (regionsWithMaxValues.length > 1) ? '<span title="'+ moreRegionsWithMaxValueString +'" class="moreInfoIcon">&#x1F6C8;</span>' : "";
	//focusVText += " across " + config.geoRegion +".";
	focusVText += ".";
	
	//Inline dots storing a gloabal array
	inlineDots.push({id:"avg", val:avg_dV});
	inlineDots.push({id:"min", val:getMin(allData, config.depVariable)});
	inlineDots.push({id:"max", val:getMax(allData, config.depVariable)});

	//focusVText += (config.causality=="no") ? ", whereas " + vIndDescriptor + config.indVariable +" ranges between " + getMin(allData, config.indVariable) + " and " + getMax(allData, config.indVariable)+"." : ".";
	
	// console.log(outliers_v2);
	if(outliers_v2.length>0){  
		outliers_v2 = outliers_v2.filter(function(d){return d[config.regionID] != maxRegion[config.regionID];});
		if (outliers_v2.length>0) focusVText += stringifyList_v2(outliers_v2,ramp,area);
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
		corr = computeCorrelation(allData);
		// console.log(corr); 
		if(corr > POSITIVE_CORRELATION){
			rText += " Overall, there is a statistical relationship between " + vIndDescriptor + config.indVariable + " and " + vDepDescriptor + config.depVariable;
			rText += ": the higher the " + vIndDescriptor + config.indVariable + "," ;
			rText += (config.typeDepVariable=="demographic-indicator" && config.situation == "positive") ? "the better is the " : " higher are the " ;
			rText += vDepDescriptor + config.depVariable + ".";
		}
		else if (corr < NEGATIVE_CORRELATION){
			rText += " Overall, there is a statistical relationship between " + vIndDescriptor + config.indVariable + " and " + vDepDescriptor + config.depVariable;
			rText += ": the higher the " + vIndDescriptor + config.indVariable + ", the lower are the " + vDepDescriptor + config.depVariable + ".";
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
	// makeInlineDots(area);
}
function describeOddRegions(l, u, ramp){
	
	var lObjects = getObjectsByNames(allData,l);
	var uObjects = getObjectsByNames(allData,u);
	// console.log(uObjects);
	// console.log(lObjects);

	var s="";
	if (l.length>0 || u.length >0){
		s += " The ";
		if (u.length > 0){
			s +=  (u.length == 1) ? config.granularity + " ": config.granularity.getPlural() + " " ;
			s += stringifyListOfObjectswithColorCoding(uObjects,ramp);
			s += " are different from their respective neighboring "+ config.granularity.getPlural() + " as they "; 
			if(config.typeDepVariable == "casualties"){
				s += " suffered comparatively a lot more casualties ";
				s += '<span title="'+ infoDifferentFromNeighboringRegions +'" class="moreInfoIcon">&#x1F6C8;</span>' + "."; 
			}
		}
		if (l.length > 0){
			s +=  (l.length == 1) ? config.granularity + " ": config.granularity.getPlural() + " " ;
			s += stringifyListOfObjectswithColorCoding(lObjects,ramp);
			s += " are different from their respective neighboring "+ config.granularity.getPlural() + " as they "; 
			if(config.typeDepVariable == "casualties"){
				s += " suffered comparatively a lot less casualties ";
				s += '<span title="'+ infoDifferentFromNeighboringRegions +'" class="moreInfoIcon">&#x1F6C8;</span>' + "."; 
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
			s += " and " + '<span class="rID">' + list[i][config.regionID].toProperCase()+ '</span>' ;
		}
		else {
			s+= '<span class="rID">' + list[i][config.regionID].toProperCase()+ '</span>'+ ", ";
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

	var olDepV = getUpperUnivariateOutliers(allData, config.depVariable);
	var olIndV = getUpperUnivariateOutliers(allData, config.indVariable);

	// console.log(olDepV);
	// console.log(olIndV);

	//Case 1 - upper outlier in both variables
	if(isExist(olDepV, list[0][config.regionID]) && isExist(olIndV, list[0][config.regionID])){
		s += " In comparison to the other " + config.granularity.getPlural() + ", ";
		s += '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += getVerb("s","past",depVerb) + " high " + vDepDescriptor + " " +config.depVariable;
		s += (config.causality=="yes")? " as a result of " : " as well as ";
		s += " a high " + vIndDescriptor + " "+ config.indVariable + "." ;
	}
	//removing the outlier that was stated - only remove if there are more that 2 bivariate outliers
	if (list.length>=2){
		list = list.filter(function(d){return d[config.regionID] != list[0][config.regionID];});
	}

	// console.log(list);
	//Case 2 - outlier in dependent variable but not in independent variable
	if(isExist(olDepV, list[0][config.regionID]) && !isExist(olIndV, list[0][config.regionID])){
		s += " Despite having a relatively small "+ vIndDescriptor + " " +config.indVariable + " (" ;
		s += '<span class="rID" style="background-color:'+ramp(list[0][config.indVariable])+'">' + list[0][config.indVariable] + '</span>'+ vIndUnit + "), ";
		s += '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += " shows a high " + vDepDescriptor + " " + config.depVariable + " (" + list[0][config.depVariable]+ vDepUnit + '<svg width="'+ W +'"height="'+ H + '" id="bol"></svg>' +").";
		inlineDots.push({id:"bol", val:+list[0][config.depVariable]});
	}

	if(!isExist(olDepV, list[0][config.regionID]) && isExist(olIndV, list[0][config.regionID])){
		s += " In comparison to the other " + config.granularity.getPlural() + ", ";
		s += '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += getVerb("s","past",depVerb) + " low " + vDepDescriptor + " " +config.depVariable ;
		s += (config.causality == "yes") ? " despite a high " : " and a high " ;
		s +=  vIndDescriptor + " "+ config.indVariable + "." ;
	}
	//is it even possible?
	if(!isExist(olDepV, list[0][config.regionID]) && !isExist(olIndV, list[0][config.regionID])){
		s += " In comparison to the other " + config.granularity.getPlural() + ", ";
		s += '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' ; 
		s += getVerb("s","past",depVerb) + " low " + vDepDescriptor + " " +config.depVariable + " and low "+ vIndDescriptor + " "+ config.indVariable + "." ;
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

function stringifyList_v2(list,ramp,area){
	//TESTED
	var string="";
	// moreRegionsString = stringifyListOfObjects(list);
	// console.log(list);
	var completeList = list;
	list = getTopNItems(list, 3, 4, config.depVariable);

	switch (list.length) {
		case 1:  
			string += " Other "+ config.granularity + " showing high ";
			string += vDepDescriptor + " " + config.depVariable + " is " + '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' +" (" +list[0][config.depVariable].toLocaleString() + '<svg width="'+ W +'"height="'+ H + '" id="uol0"></svg>' + ")." ;
			// string += (config.causality == "yes") ? " as a result of "+ list[0][config.indVariable].toLocaleString() + " " + config.indVariable+"." : ".";
			inlineDots.push({id:"uol0", val:list[0][config.depVariable]});
			break;
		case 2:
			string += " Other "+ config.granularity.getPlural() + " showing high ";
			string += vDepDescriptor + " " + config.depVariable + " are " + '<span class="rID">' + list[0][config.regionID].toProperCase()+ '</span>' + " (" + list[0][config.depVariable].toLocaleString() + '<svg width="'+ W +'"height="'+ H + '" id="uol0"></svg>' + ")" + " and "+ '<span class="rID" style="background-color:'+ramp(list[1][config.indVariable])+'">' + list[1][config.regionID].toProperCase()+ '</span>' + " (" + list[1][config.depVariable] + '<svg width="'+ W +'"height="'+ H + '" id="uol1"></svg>' + ").";
			inlineDots.push({id:"uol0", val:list[0][config.depVariable]});
			inlineDots.push({id:"uol1", val:list[1][config.depVariable]});
			break;
		default:
			string += " Other "+ config.granularity.getPlural() + " showing high ";
			string += vDepDescriptor + config.depVariable + " are "; 
			for(i=0;i<list.length;i++){
				if(i < list.length -1){
					string += '<span class="rID">' + list[i][config.regionID].toProperCase()+ '</span>' + " (" +list[i][config.depVariable]+ '<svg width="'+ W +'"height="'+ H + '" id=uol'+i+'></svg>' + ")" + ", ";
					var sid="uol"+i;
					inlineDots.push({id:sid, val:+list[i][config.depVariable]});
				}
				else {
					string += " and " + '<span class="rID">' + list[i][config.regionID].toProperCase()+ '</span>' + " (" +list[i][config.depVariable]+  '<svg width="'+ W +'"height="'+ H + '" id=uol'+i+'></svg>' + ")";
					var sid="uol"+i;
					inlineDots.push({id:sid, val:+list[i][config.depVariable]});
				}

			}
			if (completeList.length>list.length){
				string += '<span title="'+ stringifyListOfObjectsWithValues(completeList) +'" class="moreInfoIcon">&#x1F6C8;</span>';
			}
			// string += '<span title="'+ moreRegionsString +'" class="moreInfoIcon">&#x1F6C8;</span>'; 
			string += "."
			break;
	}
	return string;
}
function stringifyListOfObjectsWithValues(list){
	var s = "";
	for (var i=0;i<list.length;i++){
		if (i==list.length-1){
			s+= "and "+list[i][config.regionID] + " ("+list[i][config.depVariable]+ ")";
		}
		else {
			s+= list[i][config.regionID]+ " ("+list[i][config.depVariable]+ "), ";
		}
	}
	return s; 
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
	//clearing previous dots for clicked region.
	inlineDotsEOD.length=0;
	
	document.getElementById("eod-head").innerHTML = name.toProperCase();
	var selectedRegion = allData.filter(function(d){return d[config.regionID].toLowerCase() == name.toLowerCase()});
	if (selectedRegion[0] == undefined) {
		$("#eod").html("Data not available!");
		return;
	}

	var value_dV = selectedRegion[0][config.depVariable];
	var value_iV = selectedRegion[0][config.indVariable];
	var avg_dV = getAverage(allData, config.depVariable);
	var avg_iV = getAverage(allData, config.indVariable);
	// console.log(value_iV); 

	//Based on dependant variable
	exp += name.toProperCase() ; 
	exp += getVerb("s","past",depVerb) ;

	if(value_dV == getMin(allData,config.depVariable)) {
		exp += (value_dV==0) ? "no " : "the lowest" + vDepDescriptor + config.depVariable + " (" + value_dV +  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eod0"></svg>'+ ") ";
		inlineDotsEOD.push({id:"eod0", val:+value_dV});
	}
	else if(value_dV == getMax(allData,config.depVariable)) {
		exp += (value_dV==0) ? "no " : "the highest" + vDepDescriptor +config.depVariable+ " (" + value_dV +  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eod0"></svg>'+ ") ";
		inlineDotsEOD.push({id:"eod0", val:+value_dV});
	}
	else if(value_dV > avg_dV){
		exp += " an above average "  + vDepDescriptor +  config.depVariable+ " (" + value_dV +  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eod0"></svg>'+ ") ";
		inlineDotsEOD.push({id:"eod0", val:+value_dV});
	}
	else if (value_dV < avg_dV){
		exp += " a below average "  + vDepDescriptor +  config.depVariable+ " (" + value_dV +  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eod0"></svg>'+ ") ";
		inlineDotsEOD.push({id:"eod0", val:+value_dV});
	}
	//Based on independant variable
	if(value_iV == getMin(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "the lowest" + vIndDescriptor + config.indVariable + " (" + '<span class="rID" style="background-color:'+ramp(value_iV)+'">' + value_iV.toLocaleString() + '</span>' +vIndUnit +") ";
	}
	else if(value_iV == getMax(allData,config.indVariable)) {
		exp += " and " ;
		exp += (value_iV==0) ? "no " : "highest" + vIndDescriptor + config.indVariable + "(" + '<span class="rID" style="background-color:'+ramp(value_iV)+'">' + value_iV.toLocaleString()+ '</span>' +vIndUnit +") ";
		
	}
	else if(value_iV > avg_iV){
		exp += " and an above average "+ vIndDescriptor+ config.indVariable + " (";
		exp += '<span class="rID" style="background-color:'+ramp(value_iV)+'">' + value_iV.toLocaleString() + '</span>'+vIndUnit +") ";
		// exp += config.indVariable;
	}
	else if (value_iV < avg_iV){
		exp += " and a below average "+ vIndDescriptor+ config.indVariable + " (";
		exp += '<span class="rID" style="background-color:'+ramp(value_iV)+'">' + value_iV.toLocaleString() + '</span>'+vIndUnit +") ";
		// exp += config.indVariable;
	}

	exp += " compared to the other " + config.granularity.getPlural() + "."; 
	// console.log(selectedRegion);
	allData.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});
	var rank = allData.findIndex(x => x[config.regionID].toLowerCase() == name.toLowerCase()) +1; 
	exp += " It ranks " + toOrdinal(rank) + " among all regions with respect to "+ config.depVariable + "."; 

	if(existNeighborsInfo){
		var neighbors = geo_neighbors[name.toProperCase()].split(",");
		// console.log(neighbors);
		var neighbor_objects = getObjectsByNames(allData, neighbors);
		// console.log(neighbor_objects);
		var arrOfNeighborValues = ListOfObjToArray(neighbor_objects, [config.depVariable]);

		// console.log(arrOfNeighborValues); 

		if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])=="upper"){
			var objs = getObjectsByNames(allData, neighbors); 

			exp += " Compared to its neighbors (";
			exp += stringifyListOfObjectswithColorCoding(objs, ramp);
			exp +=  "), " + name.toProperCase();
			exp += getVerb("s","past", depVerb) + "substantially more " + config.depVariable + ".";
		}
		else if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])=="lower"){
			var objs = getObjectsByNames(allData, neighbors); 
			exp += " Compared to its neighbors (";
			exp += stringifyListOfObjectswithColorCoding(objs, ramp);
			exp += "), " + name.toProperCase();
			exp += getVerb("s","past", depVerb) ;
			exp += (config.typeDepVariable == "continuous") ? " very few " : " less "; 
			exp += config.depVariable + ".";
		}
	}
	$("#eod").html(exp);
	makeInlineDotsEOD();
}
function compareTwoRegions(a,b,ramp){
	var comText = "";
	inlineDotsEOD.length=0;
	document.getElementById("eod-head").innerHTML = "Comparison of " + a + " and " + b;

	var aObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == a.toLowerCase()})[0];
	var bObj = allData.filter(function(d){return d[config.regionID].toLowerCase() == b.toLowerCase()})[0];
	// console.log(aObj);
	// console.log(bObj);
	var is_a_mentionded = false; 
	var is_b_mentionded = false; 

	if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += '<span class="rID">' + a + '</span>'; 
		comText +=  getVerb("s","past",depVerb) + "a higher " + vDepDescriptor + config.depVariable + " ("+aObj[config.depVariable]+ vDepUnit+ '<svg width="'+ W +'"height="'+ H + '" id="eodA"></svg>' + ") ";
		comText += " and a higher "+ vIndDescriptor +  config.indVariable + " (";
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + aObj[config.indVariable].toLocaleString() + '</span>'+ vIndUnit; 
		comText += ") ";
		is_a_mentionded= true;
		inlineDotsEOD.push({id:"eodA", val:+aObj[config.depVariable]});
	}
	else if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += '<span class="rID">' + b + '</span>'; 
		comText += getVerb("s","past",depVerb) + "a higher "+ vDepDescriptor + config.depVariable + " (" + bObj[config.depVariable] +  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eodB"></svg>' + ") ";
		comText += " and a higher " + vIndDescriptor + config.indVariable + " (";
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + bObj[config.indVariable].toLocaleString() + '</span>'+vIndUnit; 
		comText += ") "; 
		is_b_mentionded = true;
		inlineDotsEOD.push({id:"eodB", val:+bObj[config.depVariable]});
	}
	else if(+aObj[config.depVariable]>+bObj[config.depVariable] && +aObj[config.indVariable]<+bObj[config.indVariable]){
		comText += '<span class="rID">' + a + '</span>'; 
		comText += getVerb("s","past",depVerb) + "a higher " + vDepDescriptor + config.depVariable + " ("+aObj[config.depVariable]+  vDepUnit+ '<svg width="'+ W +'"height="'+ H + '" id="eodA"></svg>' + ") ";
		comText += " but a lower " + vIndDescriptor + config.indVariable + " (";
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + aObj[config.indVariable].toLocaleString()+vIndUnit + '</span>';
		comText += ") "; 
		is_a_mentionded= true;
		inlineDotsEOD.push({id:"eodA", val:+aObj[config.depVariable]});
	}
	else if(+aObj[config.depVariable]<+bObj[config.depVariable] && +aObj[config.indVariable]>+bObj[config.indVariable]){
		comText += '<span class="rID">' + b + '</span>'; 
		comText += getVerb("s","past",depVerb) + "a higher " + vDepDescriptor + config.depVariable + " ("+bObj[config.depVariable]+  vDepUnit+  '<svg width="'+ W +'"height="'+ H + '" id="eodB"></svg>' + ") ";
		comText += " but a lower " + vIndDescriptor + config.indVariable + " (";
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + bObj[config.indVariable].toLocaleString() + '</span>'+vIndUnit;
		comText += ") ";
		is_b_mentionded = true; 
		inlineDotsEOD.push({id:"eodB", val:+bObj[config.depVariable]});
	}
	if (is_a_mentionded){
		comText += " compared to "; 
		comText += '<span class="rID">' + b + '</span>';
		comText += " (" + bObj[config.depVariable]+  vDepUnit+  " "+ '<svg width="'+ W +'"height="'+ H + '" id="eodB"></svg>' + config.depVariable+  ", ";
		comText += '<span class="rID" style="background-color:'+ramp(bObj[config.indVariable])+'">' + bObj[config.indVariable].toLocaleString() + '</span>'+vIndUnit;
		comText += " "+config.indVariable +").";
		inlineDotsEOD.push({id:"eodB", val:+bObj[config.depVariable]});
	}
	else if (is_b_mentionded){
		comText += " compared to ";
		comText += '<span class="rID">' + a + '</span>';
		comText += " (" + aObj[config.depVariable]+  vDepUnit+" "+ '<svg width="'+ W +'"height="'+ H + '" id="eodA"></svg>' + " "+ config.depVariable+ ", ";
		comText += '<span class="rID" style="background-color:'+ramp(aObj[config.indVariable])+'">' + aObj[config.indVariable].toLocaleString()+ '</span>'+vIndUnit ;
		comText += " "+config.indVariable +").";
		inlineDotsEOD.push({id:"eodA", val:+aObj[config.depVariable]});
	}
	document.getElementById("eod").innerHTML = comText; 
	is_a_mentionded = false; 
	is_b_mentionded = false; 
	makeInlineDotsEOD();
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
	// console.log(p);
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
	// console.log(arr2D);
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
		text += "A higher "+ vDepDescriptor + config.depVariable + " are associated with a higher " + vIndDescriptor + config.indVariable +" among "; 
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
		text += "A lower " + vDepDescriptor + config.depVariable + " are associated with a higher "+ vIndDescriptor + config.indVariable +" among "; 
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
					text =  " "+ dRs[3].appendPostFix() + " "+ config.granularity.getPlural() + getVerb("s","past",indVerb) + " higher " + vDepDescriptor + config.depVariable + " and " + config.indVariable +" compared to the other "+ config.granularity.getPlural(); 
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

function makeInlineDots(scale){
	w=30;
	h=30;
	
	for (var i=0;i<inlineDots.length;i++){
		var key = d3.select("#" + inlineDots[i].id)
		.append('g')
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");
	
		key.append("circle")
			.attr("class", "dots")
			.attr("fill", dotColor)
			.attr("cx",w/2 )
			.attr("cy",h/2)
			.attr("r",Math.sqrt(scale(inlineDots[i].val)*2/Math.PI));
	}
}
function makeInlineDotsEOD(){
	var mindepVal = getMin(allData, config.depVariable);
	var maxdepVal = getMax(allData, config.depVariable);
	var scale = d3.scaleLinear().domain([mindepVal,maxdepVal]).range([1,225]);
	w=30;
	h=30;
	for (var i=0;i<inlineDotsEOD.length;i++){
		var key = d3.select("#" + inlineDotsEOD[i].id)
		.append('g')
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");
	
		key.append("circle")
			.attr("class", "dots")
			.attr("fill", dotColor)
			.attr("cx",w/2 )
			.attr("cy",h/2)
			.attr("r",Math.sqrt(scale(inlineDotsEOD[i].val)*2/Math.PI));
	}
}