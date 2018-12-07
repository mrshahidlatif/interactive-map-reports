setwd("C:\\inetpub\\wwwroot\\imr\\")

data <- read.csv("data\\storms-death-data.csv")
#data <- read.csv("health-life-expectancy.csv")

X<- data$deaths
Y<-data$storms
boxplot(Y,data=data, width=0.2, main="Distribution of data", 
        xlab="Storms", ylab="Deaths")

boxplot(X,
        horizontal=TRUE,las=1,
        main="Distribution of deaths")


attach(data)
plot(Y, X, main = "Scatter plot", xlab="#Storms", ylab="#Deaths", pch = 16, cex = 1.0)


library(aplpack)
par(mar=c(5,6,4,1)+.1)
p <- bagplot(Y, X, factor = 3, na.rm = FALSE, approx.limit = 100,
        show.outlier = TRUE, show.whiskers = TRUE,
        show.looppoints = TRUE, show.bagpoints = TRUE,
        show.loophull = TRUE, show.baghull = TRUE,
        create.plot = TRUE, add = FALSE, pch = 16, cex = 1.0,
        dkmethod = 2, precision = 1, verbose = FALSE,
        debug.plots = "no", col.loophull="#aaccff",
        col.looppoints="#3355ff", col.baghull="#7799ff",
        col.bagpoints="#000088", transparency=FALSE,  xlab="No. of storms", ylab="No. of deaths", cex.axis=1.5, cex.lab=1.8)

title("Deaths caused by storms - USA, 2017")

library(mvoutlier)
d<-cbind(Y,X)
aq.plot(d, quan=1/2, alpha = 0.05)

dd.plot(d)
symbol.plot(d)
color.plot(d)

