function generateNarrative(data){
	// console.log(data);
	var text = "";
	// var senTemp = "The state of <State> reported <Deaths> casualities in <Storms> during this year. ";
	for(var i=0;i<data.length;i++){
		if(data[i].Extremes=="max"){
			// text += paramParser(dictionary[Math.floor(Math.random() * (3 - 1 + 1)) + 1],data[i]);
			text += paramParser(dictionary[1],data[i]);
		}

	}

	// for(var i=0;i<data.length;i++){
	// 	if(data[i].Extremes=="min"){
	// 		text += paramParser(dictionary[Math.floor(Math.random() * (3 - 1 + 1)) + 1],data[i]);
	// 	}
	// }
		for(var i=0;i<data.length;i++){
		if(data[i].Outlier=="1"){
			text += paramParser(dictionary[Math.floor(Math.random() * (3 - 1 + 1)) + 1],data[i]);
		}
	}
	// return "I will give you some nice text.....!!! Just hang on in there!"
	return text; 
}

function paramParser(secentenceStructure, dataRow){
	var outputText = "";
	var tokens = secentenceStructure.split(" ");
	for(var i=0;i<tokens.length;i++){
		if(tokens[i].charAt(0) == "<" && tokens[i].charAt(tokens[i].length-1) == ">"){
			var attr = tokens[i].substring(1, tokens[i].length-1);
			tokens[i] = dataRow[attr]; 
		}
	}
	// console.log(tokens.join(" "));
	return tokens.join(" "); 
}