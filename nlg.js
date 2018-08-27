var allData; 
function generateNarrative(data,config){
	console.log(data); 
	// console.log(config); 
	var text="";
	data.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});
	console.log(data); 
	//First Sentence
	if (config.unit == "number"){
		text += "The map visualization shows number of " + config.depVariable + " caused by " + config.indVariable + " in " + config.geoRegion + " during " + config.year + ".";

	}
	else if (config.unit == "percentage"){
		text += "The map visualization shows " + config.depVariable + " in proportion to the " + config.indVariable + " in " + config.geoRegion + " during " + config.year + ".";
	}

	//Univariate Outliers
	var outliers_v2 = getDataByFlag(data,"MAXV2");
	console.log(outliers_v2);
	text += stringifyList_v2(outliers_v2);

	data.sort(function(a,b){return +b[config.indVariable] - +a[config.indVariable]});
	// console.log(data); 

	var outliers_v1 = getDataByFlag(data, "MAXV1")
	text += stringifyList_v1(outliers_v1);


	var bivariate_outliers = getDataByFlag(data, "BOL");
	bivariate_outliers.sort(function(a,b){a.v2_v1_ratio - b.v2_v1_ratio});
	// console.log(bivariate_outliers); 
	text += " Relatively small number of " + config.indVariable + " did huge damage in " + bivariate_outliers[2][config.regionID].toProperCase()+" killing " + bivariate_outliers[2][config.depVariable] + " people in just " + bivariate_outliers[2][config.indVariable] + " " + config.indVariable +".";

	return text; 
}
function stringifyList_v2(list){
	var string="";
	switch (list.length) {
		case 1:
			string += " Maximum number of " +list[0][config.depVariable] + " " + config.depVariable + " are caused by " + list[0][config.indVariable] + " " + config.indVariable + " in " + list[0][config.regionID].toProperCase() + ".";
			break;
		case 2:
			string += string += " Maximum number of " +list[0][config.depVariable] + " " + config.depVariable + " are caused by " + list[0][config.indVariable] + " " + config.indVariable + " in " + list[0][config.regionID].toProperCase() + " followed by "+list[1][config.regionID] +", where "+list[1][config.indVariable]+" "+config.indVariable + " caused "+list[1][config.depVariable] + " "+ config.depVariable+ ".";
			break;
		default:
			string += " Maximum number of " +list[0][config.depVariable] + " " + config.depVariable + " are caused by " + list[0][config.indVariable] + " " + config.indVariable + " in " + list[0][config.regionID].toProperCase() + " followed by ";
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
			string += " Maximum number of " +list[0][config.indVariable] + " " + config.indVariable + " are experienced " + " in " + list[0][config.regionID].toProperCase() + " causing " + list[0][config.depVariable] + " " + config.depVariable +".";
			break;
		case 2:
			string += " Maximum number of " +list[0][config.indVariable] + " " + config.indVariable + " are experienced " + " in " + list[0][config.regionID].toProperCase() + " causing " + list[0][config.depVariable] + " " + config.depVariable +" followed by "+list[1][config.regionID] +", where "+list[1][config.indVariable]+" "+config.indVariable + " caused "+list[1][config.depVariable] + " "+ config.depVariable+ ".";
			break;
		default:
			string += " Maximum number of " +list[0][config.indVariable] + " " + config.indVariable + " are experienced " + " in " + list[0][config.regionID].toProperCase() + " causing " + list[0][config.depVariable] + " " + config.depVariable +" followed by ";
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
	// console.log(allData); 
	
	document.getElementById("eod-head").innerHTML = name.toProperCase();
	var selectedRegion = allData.filter(function(d){return d[config.regionID].toLowerCase() == name.toLowerCase()});
	if(selectedRegion[0][config.depVariable] == 0){
		exp += "There was no fatality in the state of Utah despite "+ selectedRegion[0][config.indVariable] +" stormy events."
	}
	else {
		exp += "In "+ selectedRegion[0][config.regionID].toProperCase() + ", " + selectedRegion[0][config.depVariable] + " " + config.depVariable + " are reported in "+selectedRegion[0].value+ " "+config.indVariable +"." ;
	}
	
	// console.log(selectedRegion);
	allData.sort(function(a,b){return +b[config.depVariable] - +a[config.depVariable]});
	var rank = allData.findIndex(x => x[config.regionID].toLowerCase() == name.toLowerCase()) +1; 
	exp += " It ranks " + toOrdinal(rank) + " among all regions w.r.t "+ config.depVariable + "."; 

	var neighbors = geo_neighbors[name.toProperCase()].split(",");
	// console.log(neighbors);
	var neighbor_objects = getObjectsByNames(allData, neighbors);
	var arrOfNeighborValues = ListOfObjToArray(neighbor_objects, [config.depVariable]);

	// console.log(arrOfNeighborValues); 

	if(isOutlierAmongNeighbors(arrOfNeighborValues, selectedRegion[0][config.depVariable])){
		exp += " It shows different behavior compared to it's neighboring states."
	}


	document.getElementById("eod").innerHTML = exp;
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

