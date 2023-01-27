// set the dimensions and margins of the graph
// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

function generateBarchartsForHuman(json, human) {
    // const humanDiv = barcharts.select("#"+human+"Summary")
    // let data = json.questions
    const humanDiv = barcharts.select("#" + human + "Summary")
    let data = json.questions;
    let overall = [computeOverallData(data)]
    var topsumstat = computeSummaryStatistics(overall)
    displayBarcharts(topsumstat, humanDiv)

    const contentsDiv = barcharts.select("#" + human + "Children")
    var sumstat = computeSummaryStatistics(data)
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
    console.log(sumstat)
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
            'key': id,
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
                xScale: d3.scaleLinear()
                    .domain([1, question.scale.length])
                    .range([0, width])
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

function displayHorizontalLine(sumstat, barcharts) {
    barcharts
        .selectAll(".barchart-row")
        .each(function (b, i) {
            if (i !== 0) {
                barcharts.insert("hr", "#" + b.key)
            }
        })
}

function displayBarcharts(sumstat, barcharts) {
    //console.log("Sumstat: ")
    //console.log(sumstat)
    // From sumstat: key, questionText, min, max, q1, q3, median, outliers, total
    // Define positions
    var y = height / 2
    var yBandwidth = height / 4;

    // Make barchart container, margin, and scale for each question
    displayContainersMargin(sumstat, barcharts)

    //Make captions for barcharts
    displayCaptions(sumstat, barcharts)

    // Show axis labels
    // displayAxis(sumstat, barcharts)

    // Show title
    displayTitle(sumstat, barcharts)

    // Show the range line
    // displayRange(sumstat, barcharts, y, yBandwidth)

    // Show the rectangle for the q1, q3 box
    displayBox(sumstat, barcharts, y, yBandwidth)

    // Show the median line
    // displayMedian(sumstat, barcharts, y, yBandwidth)

    // Show the outliers
    // displayOutliers(sumstat, barcharts, y, yBandwidth)

    // Show the totals
    displayTotals(sumstat, barcharts)

    // Add lines in between
    // displayHorizontalLine(sumstat, barcharts)
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
            let p = d3.select(this).select("p")
            if (p.empty()) {
                d3.select(this).append("p")
                    .text("We haven't written a summary for this barchart yet! Coming Soon!")
                    .classed("col", true)
            }
        })
}

function displayAxis(sumstat, barcharts) {
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("g") // bottom axis
        .attr("transform", "translate(0," + height + ")")
        .classed("bottomAxis", true)
        .each(function (s) {
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

// function displayRange(sumstat, barcharts, y, yBandwidth) {
//     barcharts
//         .selectAll(".margin")
//         .data(sumstat)
//         .append("line")
//         .attr("x1", function (d) {
//             return d.value.xScale(d.value.min)
//         })
//         .attr("x2", function (d) {
//             return d.value.xScale(d.value.max)
//         })
//         .attr("y1", y + yBandwidth / 2)
//         .attr("y2", y + yBandwidth / 2)
//         .attr("stroke", "black")
//         .style("width", 40)
//         .classed("range", true)
// }
function displayBox(sumstat, barcharts, y, yBandwidth) {
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("rect")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .range([0, width])
        .domain(sumstat.map(function (d) {
            return d.key;
        }))
        .padding(0.2);
    barcharts.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

// Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 13000])
        .range([height, 0]);
    barcharts
        .selectAll(".margin")
        .data(sumstat)
        .append("g")
        .call(d3.axisLeft(y));

    console.log(sumstat)
// Bars
    barcharts
        .selectAll("mybar")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.scale);
        })
        .attr("y", function (d) {
            return y(d.Value);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.Value);
        })
        .attr("fill", "#69b3a2")
}

// function displayMedian(sumstat, barcharts, y, yBandwidth) {
//     barcharts
//         .selectAll(".margin")
//         .data(sumstat)
//         .append("line")
//         .attr("y1", y)
//         .attr("y2", y + yBandwidth)
//         .attr("x1", function (d) {
//             return (d.value.xScale(d.value.median))
//         })
//         .attr("x2", function (d) {
//             return (d.value.xScale(d.value.median))
//         })
//         .attr("stroke", "black")
//         .style("width", 80)
//         .classed("median", true)
// }
// function displayOutliers(sumstat, barcharts, y) {
//     barcharts
//         .selectAll(".margin")
//         .data(sumstat)
//         .append("g")
//         .classed("outliers", true)
//         .each(function (t) {
//             d3.select(this).selectAll('circles')
//                 .data(t.value.outliers)
//                 .enter()
//                 .append('circle')
//                 .attr("cx", function (d) {
//                     return t.value.xScale(d)
//                 })
//                 .attr("cy", function() { return y + (jitterWidth * Math.random()) })
//                 .attr("r", 3)
//                 .attr("opacity", 0.2)
//         })
// }
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
            throw new Error("Phrase '" + phrase + "' not supported")
        /*
        Strongly disagree, Disagree, Slightly disagree, Slightly agree, Agree, Strongly agree
        Never, Very Rarely, Rarely, Occasionally, Frequently, Very Frequently
        There are no advertisements
        10 minutes or Less, About 30 minutes, About an hour, More than an hour or multiple hours
        Video, Image, Text, No Priority
         */
    }
}

function numberToMedia(number) {
    switch (number) {
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
            throw new Error("Media num '" + number + "' not supported")

    }
}

function mediaToNumber(media) {

    switch (media) {
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
            throw new Error("Media '" + media + "' not supported")
    }
}

function questionToScale(question) {
    switch (question) {
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
            return ["Very Frequently", "Frequently", "Occasionally", "Rarely", "Very Rarely", "Never"]
        case "A2":
            return ["Strongly agree", "Agree", "Slightly agree", "Slightly disagree", "Disagree", "Strongly disagree", "There are no advertisements"]
        case "D3":
            return ["Video", "Image", "Text", "No Priority"]
        case "D2":
            return ["10 minutes or Less", "About 30 minutes", "About an hour", "More than an hour or multiple hours"]
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