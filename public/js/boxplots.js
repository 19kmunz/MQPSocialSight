// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 50, left: 70},
    width = 400 - margin.left - margin.right,
    chunk = width/7,
    height = 200 - margin.top - margin.bottom,
    jitterWidth = height / 4;

function generateBoxplotsForHuman(json, human) {
    let data = json.questions
    let overall = [computeOverallData(data)]

    //data.append(computeOverallData(data))
    // Select the boxplot containter
    const humanDiv = boxplots.select("#"+human)

    var topsumstat = computeSummaryStatistics(overall)
    displayBoxplots(topsumstat, humanDiv.select(".summary"))

    const contentsDiv = humanDiv
        .select(".children")
        .attr("style", "padding-left: 50px;")
    // Compute summary statistics
    var sumstat = computeSummaryStatistics(data)
    // Create the html boxplots
    displayBoxplots(sumstat, contentsDiv)
    contentsDiv.classed("collapse", true)
}
function computeOverallData(data) {
    let summary = {
        "_id" : data[0].human+"_Summary",
        "qTag" : data[0].human+"_Summary",
        "mediaText" : data[0].mediaText,
        "title": humanTagToWord(data[0].human) +" Summary",
        "scale": ["STR A", "A", "SLI A", "SLI D", "D", "STR D"]
    }
    let points = []
    data.forEach(question => {
        points.push(question.points)
    })
    points = d3.merge(points).sort(d3.ascending)
    summary.points = points;
    summary.total = points.length;
    return summary;
}
function computeSummaryStatistics(data) {
    return data.map(question => {
        // For each question
        // Get the question text from the full data
        let questionText = question.title
        let media = question.mediaText
        let questionTag = question.qTag

        // Compute the boxplot summary statistics
        let q1 = d3.quantile(question.points, .25)
        let median = d3.quantile(question.points, .5)
        let q3 = d3.quantile(question.points, .75)
        let interQuantileRange = q3 - q1
        let min = d3.max([q1 - 1.5 * interQuantileRange, d3.min(question.points)])
        let max = d3.min([q3 + 1.5 * interQuantileRange, d3.max(question.points)])
        let minOutliers = question.points.filter(d => d < min)
        let maxOutliers = question.points.filter(d => d > max)
        let outliers = minOutliers.concat(maxOutliers)
        let total = question.points.length

        return {
            'key': question.qTag,
            value: {
                questionText: questionText,
                media: media,
                questionTag: questionTag,
                q1: q1,
                median: median,
                q3: q3,
                interQuantileRange: interQuantileRange,
                min: min,
                max: max,
                outliers: outliers,
                total: total,
                points: question.points,
                scale: question.scale,
                xScale : d3.scaleLinear()
                    .domain([1, question.scale.length])
                    .range([0, width])
            }
        }
    });
}
function displayBoxplots(sumstat, boxplots) {
    console.log("Sumstat: ")
    console.log(sumstat)
    // From sumstat: key, questionText, min, max, q1, q3, median, outliers, total
    // Define positions
    var y = height / 2
    var yBandwidth = height / 4;
    var x = d3.scaleLinear()
        .domain([1, 7])
        .range([0, width])

    // Make boxplot container, margin, and scale for each question
    displayContainersMargin(sumstat, boxplots)

    //Make captions for boxplots
    displayCaptions(sumstat, boxplots)

    // Show axis labels
    displayAxis(sumstat, boxplots)

    // Show title
    displayTitle(sumstat, boxplots)

    // Show the range line
    displayRange(sumstat, boxplots, x, y, yBandwidth)

    // Show the rectangle for the q1, q3 box
    displayBox(sumstat, boxplots, x, y, yBandwidth)

    // Show the median line
    displayMedian(sumstat, boxplots, x, y, yBandwidth)

    // Show the outliers
    displayOutliers(sumstat, boxplots, x, y, yBandwidth)

    // Show the totals
    displayTotals(sumstat, boxplots)
}
function displayContainersMargin(sumstat, boxplots) {
    boxplots
        .selectAll("boxplot") // No boxplots
        .data(sumstat) // Link to boxplot data
        .enter() // Create empties linked with data
        .append("div") // container div
        .attr("id", function(d) { return d.key;})
        .classed("row", true)
        .classed("boxplot-row", true)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .classed("col-md-auto", true)
        .append("g") // margin
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .classed("margin", true)
}
function displayCaptions(sumstat, boxplots) {
    boxplots
        .selectAll(".boxplot-row")
        .append("p")
        .text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus arcu aliquet, suscipit nunc vitae, euismod augue. Ut condimentum nisl mi, nec rutrum urna imperdiet at. Quisque eget nibh ipsum. Curabitur vel dui id turpis suscipit dictum ac sed massa. In dictum feugiat condimentum. Vivamus fermentum odio nisi, vel imperdiet dui pulvinar eu. Mauris sit amet finibus magna. Sed ultricies ut odio sit amet luctus. Maecenas et odio sed ipsum pellentesque eleifend.")
        .classed("col", true)
}
function displayAxis(sumstat, boxplots, scaleOld){
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("g") // bottom axis
        .attr("transform", "translate(0," + height + ")")
        .classed("bottomAxis", true)
        .each(function(s){
            let scale = d3.scalePoint()
                .domain(s.value.scale)
                .range([0, width])
                .align(0)
                .padding(0)
            d3.select(this)
                .call(d3.axisBottom(scale).ticks(7))
        }) // TODO: dynamically set the axis labels
        .select(".domain").remove()
}
function displayTitle(sumstat, boxplots) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("text")
        .attr("x", 0)
        .attr("y", margin.top)
        .classed("title", true)
        .text(function (d) {
            return d.value.questionText + ((d.value.media) ? " - " + d.value.media : "")
        })
        .call(wrap, width) // TODO fix dx by sending text element
}
function displayRange(sumstat, boxplots, xScale, y, yBandwidth) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("line")
        .attr("x1", function (d) {
            return d.value.xScale(d.value.min)
        })
        .attr("x2", function (d) {
            return d.value.xScale(d.value.max)
        })
        .attr("y1", y + yBandwidth / 2)
        .attr("y2", y + yBandwidth / 2)
        .attr("stroke", "black")
        .style("width", 40)
        .classed("range", true)
}
function displayBox(sumstat, boxplots, xScale, y, yBandwidth) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("rect")
        .attr("x", function (d) {
            return d.value.xScale(d.value.q1)
        })
        .attr("width", function (d) {
            return (d.value.xScale(d.value.q3) - d.value.xScale(d.value.q1))
        })
        .attr("y", y)
        .attr("height", yBandwidth)
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
        .classed("box", true)
}
function displayMedian(sumstat, boxplots, xScale, y, yBandwidth) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("line")
        .attr("y1", y)
        .attr("y2", y + yBandwidth)
        .attr("x1", function (d) {
            return (d.value.xScale(d.value.median))
        })
        .attr("x2", function (d) {
            return (d.value.xScale(d.value.median))
        })
        .attr("stroke", "black")
        .style("width", 80)
        .classed("median", true)
}
function displayOutliers(sumstat, boxplots, xScale, y, yBandwidth) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("g")
        .classed("outliers", true)
        .each(function (t) {
            d3.select(this).selectAll('circles')
                .data(t.value.outliers)
                .enter()
                .append('circle')
                .attr("cx", function (d) {
                    return t.value.xScale(d)
                })
                .attr("cy", function() { return y + (jitterWidth * Math.random()) })
                .attr("r", 3)
                .attr("opacity", 0.2)
        })
}
function displayTotals(sumstat, boxplots) {
    boxplots
        .selectAll(".margin")
        .data(sumstat)
        .append("text")
        .classed("total", true)
        .text(function(d) { return "# Responses: " + (d.value.total) })
        .attr("x", 0)
        .attr("y", height + 35)
}

// https://stackoverflow.com/questions/24784302/wrapping-text-in-d3?lq=1
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        // While there are words to check
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            // If this word creates overflow
            if (tspan.node().getComputedTextLength() > width) {
                // Remove the overflow word
                line.pop();
                // Set the real text
                tspan.text(line.join(" "));
                // Compute the real text length and center
                let length = tspan.node().getComputedTextLength()
                tspan.attr("dx", (width - length)/2)
                // Prepare the next tspan for the rest of the words
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
        // Compute the real text length and center for leftover
        let length = tspan.node().getComputedTextLength()
        // tspan.attr("dx", (width - length)/2)
        tspan.attr("dx", 0)
    });
}

function phraseToNumber(phrase) {
    switch (phrase) {
        case "Strongly agree":
        case "Very Frequently":
        case "10 minutes or Less":
        case "Video":
            return 1;
        case "Agree":
        case "Frequently":
        case "About 30 minutes":
        case "Image":
            return 2;
        case "Slightly agree":
        case "Occasionally":
        case "About an hour":
        case "Text":
            return 3;
        case "Slightly disagree":
        case "Rarely":
        case "More than an hour or multiple hours":
        case "No priority":
            return 4;
        case "Disagree":
        case "Very Rarely":
            return 5;
        case "Strongly disagree":
        case "Never":
            return 6;
        case "There are no advertisements":
            return 7;
        case "":
            return null;
        default:
            throw new Error("Phrase '" +phrase+"' not supported")
        /*
        Strongly disagree, Disagree, Slightly disagree, Slightly agree, Agree, Strongly agree
        Never, Very Rarely, Rarely, Occasionally, Frequently, Very Frequently
        There are no advertisements
        10 minutes or Less, About 30 minutes, About an hour, More than an hour or multiple hours
        Video, Image, Text, No Priority
         */
    }
}
function numberToMedia(number){
    switch(number){
        case 1:
            return "Twitter";
        case 2:
            return "Instagram";
        case 3:
            return "Reddit";
        case 4:
            return "Tumblr";
        case 5:
            return "Tik Tok";
        case 6:
            return "BeReal";
        case 7:
            return "YouTube";
        case 8:
            return "Snapchat";
        case 9:
            return "Facebook";
        case 10:
            return "4Chan";
        case 11:
            return "LinkedIn";
        case 12:
            return "Twitch";
        default:
            throw new Error("Media num '" +number+"' not supported")

    }
}
function mediaToNumber(media){

    switch(media) {
        case "Twitter":
            return 1;
        case "Instagram":
            return 2;
        case "Reddit":
            return 3;
        case "Tumblr":
            return 4;
        case "Tik Tok":
            return 5;
        case "BeReal":
            return 6;
        case "YouTube":
            return 7;
        case "Snapchat":
            return 8;
        case "Facebook":
            return 9;
        case "4Chan":
            return 10;
        case "LinkedIn":
            return 11;
        case "Twitch":
            return 12;
        default:
            throw new Error("Media '" +media+"' not supported")
    }
}
function questionToScale(question){
    switch (question){
        case "C1":
        case "C2":
        case "C3":
        case "C6":
        case "D1":
        case "D5":
        case "D6":
        case "D7":
        case "D8":
        case "A3":
        case "A4":
            return ["Very Frequently", "Frequently", "Occasionally", "Rarely", "Very Rarely", "Never" ]
        case "A2":
            return ["Strongly agree", "Agree", "Slightly agree", "Slightly disagree", "Disagree", "Strongly disagree", "There are no advertisements"]
        case "D3":
            return ["Video", "Image", "Text", "No Priority"]
        case "D2":
            return["10 minutes or Less", "About 30 minutes", "About an hour", "More than an hour or multiple hours"]
        default:
            return ["Strongly agree", "Agree", "Slightly agree", "Slightly disagree", "Disagree", "Strongly disagree"]
    }
}

function humanTagToWord(tag) {
    switch (tag) {
        case "D":
            return "Discovery: Creativity and Satisfaction"
        case "C":
            return "Culture: Community and Connection"
        case "S":
            return "Self: Identity and Ego"
        case "A":
            return "Control: Agency and Comfort"
    }
}