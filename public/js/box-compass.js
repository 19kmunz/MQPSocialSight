//TODO: Get this from Mongo
//[0] -> A number from agency (0) to discovery (100)
//[1] -> A number from community (0) to self (100)

const social_media = {
    "BeReal": [0, 0, "https://upload.wikimedia.org/wikipedia/en/4/40/BeReal_logo.png"],
    "Facebook": [70, 10, "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png"],
    "Instagram": [23, 52.5, "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/264px-Instagram_logo_2016.svg.png?20210403190622"],
    "LinkedIn": [52, 43, "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png"],
    "Reddit": [58.6, 52.1, "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Reddit_icon.svg/2048px-Reddit_icon.svg.png"],
    "Snapchat": [10, 10, "https://upload.wikimedia.org/wikipedia/fr/archive/a/ad/20190808214526%21Logo-Snapchat.png"],
    "Tik Tok": [20, 20, "https://play-lh.googleusercontent.com/OS-MhSWOPtlUZLt0_UP5TI4juSf0XhyHxGfJa6pA-UIYkZ1BB6QHTZwaMEzZDPqYsmk=w240-h480"],
    "Tumblr": [30, 30, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Tumblr.svg/2048px-Tumblr.svg.png"],
    "Twitch": [40, 40, "https://nordgamesllc.com/wp-content/uploads/2020/12/app-icons-twitch.png"],
    "Twitter": [50, 50, "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Twitter2.svg/2048px-Twitter2.svg.png"],
    "YouTube": [60, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/640px-YouTube_social_white_square_%282017%29.svg.png"],
    "4Chan": [100, 100, "https://www.betterinternetforkids.eu/documents/167024/f518af98-d19e-462f-acca-83d217f0e208"],
};


$(function () {
    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
})
//placePins(social_media)
retrieveAndPlacePins(placePins)
function retrieveAndPlacePins(placePinFunction){
    fetch('/questions', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (json) {
            let processedData = processData(json.questions, social_media)
            placePinFunction(processedData)
        })
}
/*
Tumblr: {
C:
S:
D:
A:
}*/
/*
function computeScalesForMedia(mediaData) {
    let scales = {
        "media": mediaData[0].mediaText,
    }
    let points = []
    let groupedByHuman = d3.group(mediaData, q => q.questionTag)
    mediaData.forEach(question => {
        switch(question.reverseTag) {
            case "reverse":
                // Ex. 6 needs to be 1. p-1=5, mapping[5] = 1
                const mapping = [6, 5, 4, 3, 2, 1];
                const reversed = question.points.map(p => mapping[p - 1] || p)
                points.push(reversed)
                break;
            case "ad":
                // 1 - No ad, 2-7 STR A - STR D. Need 1-6 STR A - STR D
                points.push(question.points.filter(p => p>1).map(p => p-1))
                break;
            case "info":
                //console.log(question.points)
                break;
            default:
                points.push(question.points)
        }
        //points.push(question.points)
    })
    points = d3.merge(points).sort(d3.ascending)
    return scales;
}*/


function processData(data, social_media) {
    let groupedByMedia = d3.group(data, d => d.mediaText);
    let mediaMappedToHumanMeans ={};
    groupedByMedia.forEach( (media) => {
        let groupedByHuman = d3.group(media, q => q.human)
        let humanMappedToMeans = {};
        groupedByHuman.forEach(questionsForHuman => {
            let points = extractPointsFromQuestions(questionsForHuman);
            humanMappedToMeans[questionsForHuman[0].human]=d3.mean(points)
        })
        mediaMappedToHumanMeans[media[0].mediaText] = humanMappedToMeans
    })

    // community - self
    // discovery - agency
    // 0 - Strong Agree, 6- Strong Disagree
    let xScale = d3.scaleLinear()
        .domain([-2,2])
        .range([0, 100])
    let yScale = d3.scaleLinear()
        .domain([-2,2])
        .range([100,0])
    Object.entries(mediaMappedToHumanMeans).forEach( ([media, humanObj]) => {
        let x = (6-humanObj["D"]) - (6-humanObj["A"])
        let y = (6-humanObj["C"]) - (6-humanObj["S"])
        //let x = humanObj["C"]
        //let y = humanObj["S"]
        console.log(media, 6-humanObj["A"], 6-humanObj["D"])
        social_media[media][0] = xScale(x)
        social_media[media][1] = yScale(y)
    })
    console.log(social_media)
    return social_media;
}

function extractPointsFromQuestions(questions) {
    let points = [];
    questions.forEach((question) => {
        switch (question.reverseTag) {
            case "reverse":
                // Ex. 6 needs to be 1. p-1=5, mapping[5] = 1
                const mapping = [6, 5, 4, 3, 2, 1];
                const reversed = question.points.map(p => mapping[p - 1] || p)
                points.push(reversed)
                break;
            case "ad":
                // 1 - No ad, 2-7 STR A - STR D. Need 1-6 STR A - STR D
                points.push(question.points.filter(p => p > 1).map(p => p - 1))
                break;
            case "info":
                //console.log(question.points)
                break;
            default:
                points.push(question.points)
        }
    })
    return d3.merge(points)
}

function placePins(social_media) {
    for (var mediaData in social_media) {
        var scores = social_media[mediaData];
        var pin = $("<div/>")
            .addClass("pin")
            .css("left", "" + scores[0] + "%")
            .css("top", "" + scores[1] + "%");

        var i = $("<i/>")
            .attr("data-toggle", "tooltip")
            .attr("title", mediaData);

        mediaNoInt = mediaData.replace(/[0-9]/g, '');
        var a = $("<a/>")
            .addClass(mediaNoInt.toLowerCase())
            .attr("href", mediaData.toLowerCase() + ".html");
        // .text("fiber_manual_record");

        var img = $("<img/>")
            .addClass("icon-pin")
            .attr("src", scores[2])
            .attr("alt", mediaData);
        a.append(img)
        i.append(a)

        pin.append(i);
        $("#axes").append(pin);
    }
}

function calculate(section) {
    var score = 0;
    $("#" + section + " select").each(function () {
        score += parseFloat($(this).val());
    });
    return score;
}

function closestMedia(xScore, yScore, zScore, excludes) {
    var smallestMedia = "";
    var smallestMediaDistance = 1000;
    var closestMedia = excludes;

    for (var mediaData in social_media) {
        if (closestMedia.indexOf(mediaData) > -1) {
            continue;
        }
        var scores = social_media[mediaData];
        var d = Math.sqrt(Math.abs(Math.pow(xScore - scores[0], 2) + Math.pow(yScore - scores[1], 2) + Math.pow(zScore - scores[2], 2)));

        if (d < smallestMediaDistance) {
            smallestMediaDistance = d;
            smallestMedia = mediaData;
        }
    }

    closestMedia.push(smallestMedia);
    if (closestMedia.length >= 3) {
        return closestMedia;
    } else {
        return closestMedia(xScore, yScore, zScore, closestMedia);
    }
}