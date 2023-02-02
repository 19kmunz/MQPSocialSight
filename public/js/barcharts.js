// set the dimensions and margins of the graph
// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
    titleMargin = 65;
    chartHeight = height - titleMargin;

function generateBarchartsForHuman(json, human) {
    // const humanDiv = barcharts.select("#"+human+"Summary")
    // let data = json.questions
    let data = json.questions;
    let overall = [computeOverallData(data)]
    var topsumstat = computeSummaryStatistics(overall)
    var sumstat = computeSummaryStatistics(data)
    let maxMaxCount = d3.max(sumstat.map(d => d.value.maxCount))
    // This makes it so the y Axis is the same within all the children
    topsumstat[0].value.yAxis = d3.scaleLinear()
        .domain([0, topsumstat[0].value.maxCount])
        .range([chartHeight, 0]);

    sumstat = sumstat.map(entry => {
        entry.value.maxCount = maxMaxCount;
        entry.value.yAxis = d3.scaleLinear()
            .domain([0, maxMaxCount])
            .range([chartHeight, 0]);
        return entry;
    });

    const humanDiv = barcharts.select("#" + human + "Summary")
    displayBarcharts(topsumstat, humanDiv)

    const contentsDiv = barcharts.select("#" + human + "Children")
    displayBarcharts(sumstat, contentsDiv)
    // const contentsDiv = barcharts.select("#"+human+"Children")
    // var sumstat = computeSummaryStatistics(data)
    // displayBarcharts(sumstat, contentsDiv)
}


function generateBarchartsForCombinedHuman(json, human) {
    const humanDiv = barcharts.select("#" + human + "Summary")
    let data = json.questions
    let overall = [computeOverallData(data)]
    var topsumstat = computeSummaryStatistics(overall)
    displayBarcharts(topsumstat, humanDiv)

    const contentsDiv = barcharts.select("#" + human + "Children")
    var sumstat = computeCombinedSummaryStatistics(data)
    displayBarcharts(sumstat, contentsDiv)
}

function computeOverallData(data) {
    let summary = {
        "_id": data[0].human + "_Summary",
        "qTag": data[0].human + "_Summary",
        "mediaText": data[0].mediaText,
        "title": humanTagToWord(data[0].human) + " Summary",
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
        let id = question._id

        // Compute the barchart summary statistics
        let counts = d3.flatRollup(question.points, v=> v.length, d => d)
        let maxCount = d3.max(counts.map(d => d[1]))
        let total = question.points.length

        return {
            'key': id,
            value: {
                questionText: questionText,
                media: media,
                questionTag: questionTag,
                counts: counts,
                maxCount: maxCount,
                total: total,
                points: question.points,
                scale: question.scale,
                xScale: d3.scaleBand()
                    .domain([...Array(question.scale.length).keys()].map(v => v+1))
                    .range([0, width])
                    .padding(0.2)
            }
        }
    });
}

function computeCombinedSummaryStatistics(data) {
    let newData = new Map();
    data.forEach(question => {
        // For each question
        // Get the question text from the full data
        let questionText = question.title;
        let questionTag = question.qTag;
        let media = "All Media";
        if (newData.has(questionTag)) {
            let oldPoints = newData.get(questionTag).points;
            // Compute the barchart summary statistics
            let q1 = d3.quantile(question.points.concat(oldPoints), .25)
            let median = d3.quantile(question.points.concat(oldPoints), .5)
            let q3 = d3.quantile(question.points.concat(oldPoints), .75)
            let interQuantileRange = q3 - q1
            let min = d3.max([q1 - 1.5 * interQuantileRange, d3.min(question.points.concat(oldPoints))])
            let max = d3.min([q3 + 1.5 * interQuantileRange, d3.max(question.points.concat(oldPoints))])
            let minOutliers = (question.points.concat(oldPoints)).filter(d => d < min)
            let maxOutliers = (question.points.concat(oldPoints)).filter(d => d > max)
            let outliers = minOutliers.concat(maxOutliers)
            let total = question.points.length + oldPoints.length;

            newData.set(questionTag, {
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
                points: question.points.concat(oldPoints),
                scale: question.scale,
                xScale: d3.scaleLinear()
                    .domain([1, question.scale.length])
                    .range([0, width])
            });
        } else {
            // Compute the barchart summary statistics
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

            newData.set(questionTag, {
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
                xScale: d3.scaleLinear()
                    .domain([1, question.scale.length])
                    .range([0, width])
            });
        }
    });
    const dataArr = Array.from(newData, function (entry) {
        return {key: entry[0], value: entry[1]};
    });
    return dataArr;
}

function displayBarcharts(sumstat, barcharts) {

    // Make barchart container, margin, and scale for each question
    displayContainersMargin(sumstat, barcharts)

    //Make captions for barcharts
    displayCaptions(sumstat, barcharts)

    // Show axis labels
    displayXAxis(sumstat, barcharts)
    displayYAxis(sumstat, barcharts)

    // Show title
    displayTitle(sumstat, barcharts)

    // Show barchart
    displayBars(sumstat, barcharts)

    // Show the totals
    displayTotals(sumstat, barcharts)

    // Add lines in between
    displayHorizontalLine(sumstat, barcharts)
}

function displayHorizontalLine(sumstat, barcharts) {
    barcharts
        .selectAll(".barchart-row")
        .each(function (b, i) {
            if (i !== 0) {
                barcharts.insert("hr", "#" + b.key)
            }
        })
}

function displayBars(sumstat, barcharts) {
    //d.value.xScale(d.value.q1)
    // Bars
    barcharts.selectAll(".margin")
        .append("g")
        .classed("bars", true)
        .attr("transform", "translate(0," + titleMargin + ")")
        .data(sumstat)
        .each(function (p, i) {
            d3.select(this)
                .selectAll("mybar")
                .data(p.value.counts)
                .enter()
                .append("rect")
                .attr("x", function(d) { return p.value.xScale(d[0]); })
                .attr("y", function(d) { return p.value.yAxis(d[1]); })
                .attr("width", p.value.xScale.bandwidth())
                .attr("height", function(d) { return chartHeight - p.value.yAxis(d[1]); })
                .attr("fill", "#69b3a2")
        })
}

function displayContainersMargin(sumstat, barcharts) {
    let bound = barcharts
        .selectAll("div")
        .data(sumstat, function (d) {
            return d ? d.key : this.id;
        }) // Link to barchart data
    let svgContainer = bound
        .join(enter =>
                enter.append("div") // container div
                    .attr("id", function (d) {
                        return d.key;
                    })
                    .classed("row", true)
                    .classed("barchart-row", true)
            ,
            update => update
            //.attr("style", function(d) { console.log("update " + d.key); return "background-color: purple;"; }) // comment
        )
        .sort(function (a, b) {
            if (a.key[1] === b.key[1]) {
                return 0;
            } else {
                return a.key[1] < b.key[1] ? -1 : 1;
            }
        })
    if (svgContainer.selectAll("svg").empty()) {
        svgContainer.insert("svg", ":first-child")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .classed("col-md-auto", true)
    } else {
        svgContainer.selectAll("svg").html(null)
    }
    svgContainer
        .selectAll("svg")
        .append("g") // margin
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .classed("margin", true)
}

function displayCaptions(sumstat, barcharts) {
    barcharts
        .selectAll(".barchart-row")
        .each(function () {
            console.log(this)
            let p = d3.select(this).select("p")
            if(p.empty()) {
                d3.select(this).append("p")
                    .text("We haven't written a summary for this boxplot yet! Coming Soon!")
                    .classed("col", true)
                    .classed("my-auto", true)
            } else {
                p.classed("my-auto", true)
            }
        })
}

function displayXAxis(sumstat, barcharts) {
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("g") // bottom axis
        .attr("transform", "translate(0," + height + ")")
        .classed("bottomAxis", true)
        .each(function (s) {
            let scale = d3.scaleBand()
                .domain(s.value.scale)
                .range([0, width])
                .padding(0.2)
            d3.select(this)
                .call(d3.axisBottom(scale).ticks(7))
        })
}

function displayYAxis(sumstat, barcharts, y) {
    barcharts
        .selectAll(".margin")
        .append("g")
        .classed("leftAxis", true)
        .attr("transform", "translate(0," + titleMargin + ")")
        .each(function (s) {
            d3.select(this)
                .call(d3.axisLeft(s.value.yAxis).ticks(8))
        })
}

function displayTitle(sumstat, barcharts) {
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("text")
        .attr("x", 0)
        .attr("y", margin.top)
        .classed("title", true)
        .text(function (d) {
            return d.value.questionText //+ ((d.value.media) ? " - " + d.value.media : "")
        })
        .call(wrap, width) // TODO fix dx by sending text element
}

function displayTotals(sumstat, barcharts) {
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("text")
        .classed("total", true)
        .text(function (d) {
            return "# Responses: " + (d.value.total)
        })
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
            if (getLength(tspan) > width) {
                // Remove the overflow word
                line.pop();
                // Set the real text
                tspan.text(line.join(" "));
                // Compute the real text length and center
                let length = getLength(tspan)
                tspan.attr("dx", (width - length) / 2)
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
        let length = getLength(tspan)
        tspan.attr("dx", (width - length) / 2)
        //tspan.attr("dx", 0)
    });
}

function getLength(tspan) {
    let length = tspan.node().getComputedTextLength()
    return (length === 0) ? getSimulatedLength(tspan) : length
}

function getSimulatedLength(tspan) {
    let nothingBurger = d3.select("#nothingBurger")
    let text = nothingBurger
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("text")
    let fakeText = text.append(() => tspan.clone(true).node())
    let simLength = fakeText.node().getComputedTextLength()
    nothingBurger.html(null)
    return simLength
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