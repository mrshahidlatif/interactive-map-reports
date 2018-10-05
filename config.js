var e1_config = {
	"title": "Fatalities caused by storms, USA, 2017",
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "id",
	"indVariable": "storms",
	"depVariable": "deaths",
	"situation": "negative",
	"typeDepVariable": "casualties",
	"typeIndVariable": "incidents",
	"year":"2017",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/storms-death-data.csv",
	"causality": "yes"
}

var e2_config = {
	"title": "Average life expectancy and spendings on health, Europe, 2018",
	"geoRegion": "Europe",
	"granularity":"country",
	"regionID" : "id",
	"indVariable": "health expenditure",
	"depVariable": "life expectancy",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "monetary",
	"unitDepVariable": "years",
	"unitIndVariable": "USD, per houshold",
	"situation": "positive",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"data/health-life-expectancy.csv",
	"causality": "yes"
}

// var e8_config = {
// 	"title": "Pedestrian and bicyclist deaths in the USA, 2008",
// 	"geoRegion": "the United States of America",
// 	"granularity":"state",
// 	"regionID" : "id",
// 	"indVariable": "pedestrian-fatalities",
// 	"depVariable": "bicyclist-fatalities",
// 	"situation": "negative",
// 	"typeDepVariable": "casualties",
// 	"typeIndVariable": "casualties",
// 	"year":"2008",
// 	"geoJSONFile":"us-states.json",
// 	"dataFile":"data/traffic-accidents-usa.csv",
// 	"causality": "no"
// }

var e5_config = {
	"title": "Storks deliver babies, Europe, 2000",
	"geoRegion": "Europe",
	"granularity":"country",
	"regionID" : "Country",
	"indVariable": "Storks",
	"depVariable": "Birth-rate",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "quantitative",
	"unitDepVariable": "thousands, per year",
	"unitIndVariable": "number of pairs",
	"situation": "neutral",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"data/storks-birth-data.csv",
	"causality":"yes"
}

var e7_config = {
	"title": "Per capita income and population, USA, 2015",
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "state",
	"indVariable": "population",
	"depVariable": "per-capita-income",
	"unit": "number",
	"situation": "positive",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "uncountable",
	"year":"2015",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/pop-pci-usa.csv",
	"causality": "yes"
}
var e3_config = {
	"title": "Adolescent birth rates and use of internet, World, 2015",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "internet users",
	"depVariable": "adolescent birth rates",
	"unitDepVariable": "per 1,000 women",
	"unitIndVariable": "percentage of total population",
	"situation": "neutral",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "quantitative",
	"year":"2015",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/interneuse-birthrate.csv",
	"causality": "yes"
}

// var e9_config = {
// 	"title": "Obesity and internet users among countries of the world",
// 	"geoRegion": "the World",
// 	"granularity":"country",
// 	"regionID" : "country",
// 	"indVariable": "internet-users",
// 	"depVariable": "obese-people",
// 	"unitDepVariable": ">20 years old, percentage",
// 	"unitIndVariable": "percentage of total population",
// 	"situation": "negative",
// 	"typeDepVariable": "quantitative",
// 	"typeIndVariable": "quantitative",
// 	"year":"2015",
// 	"geoJSONFile":"geography/world.json",
// 	"dataFile":"data/internet-user-obesity.csv",
// 	"causality": "yes"
// }

var e8_config = {
	"title": "Deaths due to cancer and consumption of alcohol, World, 2005",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "alcohol consumption",
	"depVariable": "deaths due to cancer",
	"unitDepVariable": "per 100,000 population",
	"unitIndVariable": "per capita, pure, in litres",
	"situation": "negative",
	"typeDepVariable": "casualties",
	"typeIndVariable": "uncountable",
	"year":"2005",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/cancer-alcohol-deaths.csv",
	"causality": "yes"
}

var e6_config = {
	"title": "Litracy rate and government's expenditure on educatino, World, 2010",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "expenditure on education",
	"depVariable": "literacy rate",
	"situation": "positive",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "monetary",
	"year":"2010",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/literacy-rate-expenditure-on-education.csv",
	"causality": "yes"
}

var e4_config = {
	"title": "Obesity and consumption of alcohol, World, 2010",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "alcohol consumption",
	"depVariable": "obese people",
	"unitDepVariable": ">20 years old, percentage of total population",
	"unitIndVariable": "per capita, pure in liters",
	"situation": "negative",
	"typeDepVariable": "quantitative",
	"typeIndVariable": "uncountable",
	"year":"2010",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/alcohol-obesity.csv",
	"causality": "no"
}