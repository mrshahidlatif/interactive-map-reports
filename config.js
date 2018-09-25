var e1_config = {
	"title": "Fatalities caused by storms in the USA, 2017",
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
	"title": "Average life expectancy and spendings on health across Europe, 2018",
	"geoRegion": "Europe",
	"granularity":"country",
	"regionID" : "id",
	"indVariable": "health_expenditure",
	"depVariable": "life_expectancy",
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

var e3_config = {
	"title": "Pedestrian and bicyclist deaths in the USA, 2008",
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "id",
	"indVariable": "pedestrian-fatalities",
	"depVariable": "bicyclist-fatalities",
	"unit": "number",
	"situation": "negative",
	"typeDepVariable": "casualties",
	"typeIndVariable": "casualties",
	"year":"2008",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/traffic-accidents-usa.csv",
	"causality": "no"
}

var e4_config = {
	"title": "Storks deliver babies, Europe, 2000",
	"geoRegion": "Europe",
	"granularity":"country",
	"regionID" : "Country",
	"indVariable": "Storks",
	"depVariable": "Birth-rate",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "quantitative",
	"situation": "neutral",
	"year":"2018",
	"geoJSONFile":"geography/europe.json",
	"dataFile":"data/storks-birth-data.csv",
	"causality":"no"
}

var e5_config = {
	"title": "Per capita income in the USA, 2015",
	"geoRegion": "the United States of America",
	"granularity":"state",
	"regionID" : "state",
	"indVariable": "population",
	"depVariable": "per-capita-income",
	"unit": "number",
	"situation": "positive",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "quantitative",
	"year":"2015",
	"geoJSONFile":"us-states.json",
	"dataFile":"data/pop-pci-usa.csv",
	"causality": "yes"
}
var e6_config = {
	"title": "Adolescent birth-rates and use of internet among countries of the world",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "internet-users",
	"depVariable": "adolescent-birth-rates",
	"unit": "number",
	"situation": "neutral",
	"typeDepVariable": "demographic-indicator",
	"typeIndVariable": "quantitative",
	"year":"2015",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/interneuse-birthrate.csv",
	"causality": "yes"
}

var e7_config = {
	"title": "Obesity (>20 years old, %) and internet users (%) among countries of the world",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "internet-users",
	"depVariable": "obese-people",
	"unit": "number",
	"situation": "negative",
	"typeDepVariable": "quantitative",
	"typeIndVariable": "quantitative",
	"year":"2015",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/internet-user-obesity.csv",
	"causality": "yes"
}

var e8_config = {
	"title": "Deaths due to cancer (per 100 000 population) and alcohol consumption, 2005",
	"geoRegion": "the World",
	"granularity":"country",
	"regionID" : "country",
	"indVariable": "alcohol-consumption",
	"depVariable": "deaths-due-to-cancer",
	"unit": "number",
	"situation": "negative",
	"typeDepVariable": "quantitative",
	"typeIndVariable": "quantitative",
	"year":"2005",
	"geoJSONFile":"geography/world.json",
	"dataFile":"data/cancer-alcohol-deaths.csv",
	"causality": "yes"
}