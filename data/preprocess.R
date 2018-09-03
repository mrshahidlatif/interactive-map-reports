setwd("C:\\inetpub\\wwwroot\\imr\\data\\")

#data <- read.csv("storms-death-data.csv")
data <- read.csv("health-life-expectancy.csv")


boxplot(deaths,data=data, width=0.2, main="Distribution of data", 
        xlab="Storms", ylab="Deaths")

boxplot(deaths,storms,
        horizontal=TRUE,las=1,
        main="Distribution of deaths")


attach(data)
plot(storms, deaths, main = "Scatter plot", xlab="#Storms", ylab="#Deaths", pch = 16, cex = 1.0)


library(aplpack)
p <- bagplot(storms, deaths, factor = 3, na.rm = FALSE, approx.limit = 100,
        show.outlier = TRUE, show.whiskers = TRUE,
        show.looppoints = TRUE, show.bagpoints = TRUE,
        show.loophull = TRUE, show.baghull = TRUE,
        create.plot = TRUE, add = FALSE, pch = 16, cex = 1.0,
        dkmethod = 2, precision = 1, verbose = FALSE,
        debug.plots = "no", col.loophull="#aaccff",
        col.looppoints="#3355ff", col.baghull="#7799ff",
        col.bagpoints="#000088", transparency=FALSE,  xlab="#Storms", ylab="#Deaths")

title("Deaths caused by storms - USA, 2017")

library(mvoutlier)
d<-cbind(storms,deaths)
aq.plot(d,delta=qchisq(0.975, df=ncol(x)), quan=1/2, alpha = 0.05)

dd.plot(d)
symbol.plot(d)
color.plot(d)

