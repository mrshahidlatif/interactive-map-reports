var e1_config = {
	"geoRegion": "the United States of America",
	"granularity":"states",
	"regionID" : "id",
	"indVariable": "storms",
	"depVariable": "deaths",
	"unit": "number",
	"situation": "negative",
	"typeDepVariable": "continuous",
	"typeIndVariable": "continuous",
	"year":"2017",
	"geoJSONFile":"us-states.json",
	"dataFile":"storms-death-data.csv",
	"causality": "no"
}

var e2_config = {
	"geoRegion": "Europe",
	"granularity":"countries",
	"regionID" : "id",
	"indVariable": "health_expenditure",
	"depVariable": "life_expectancy",
	"typeDepVariable": "discrete",
	"typeIndVariable": "discrete",
	"situation": "positive",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"health-life-expectancy.csv",
	"causality": "no"
}