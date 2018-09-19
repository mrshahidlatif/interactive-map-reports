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
	"dataFile":"data/storms-death-data.csv",
	"causality": "yes"
}

var e2_config = {
	"geoRegion": "Europe",
	"granularity":"country",
	"regionID" : "id",
	"indVariable": "health_expenditure",
	"depVariable": "life_expectancy",
	"typeDepVariable": "discrete",
	"typeIndVariable": "discrete",
	"situation": "positive",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"data/health-life-expectancy.csv",
	"causality": "no"
}

var e3_config = {
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "id",
	"indVariable": "pedestrian-fatalities",
	"depVariable": "bicyclist-fatalities",
	"unit": "number",
	"situation": "negative",
	"typeDepVariable": "continuous",
	"typeIndVariable": "continuous",
	"year":"2008",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/traffic-accidents-usa.csv",
	"causality": "no"
}

var e4_config = {
	"geoRegion": "Europe",
	"granularity":"countries",
	"regionID" : "Country",
	"indVariable": "Storks",
	"depVariable": "Birth-rate",
	"typeDepVariable": "discrete",
	"typeIndVariable": "continuous",
	"situation": "neutral",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"data/storks-birth-data.csv",
	"causality":"no"
}

var e5_config = {
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "state",
	"indVariable": "population",
	"depVariable": "per-capita-income",
	"unit": "number",
	"situation": "positive",
	"typeDepVariable": "discrete",
	"typeIndVariable": "discrete",
	"year":"2015",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/pop-pci-usa.csv",
	"causality": "no"
}