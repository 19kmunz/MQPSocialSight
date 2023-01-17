//TODO: Get this from Mongo
//[0] -> A number from agency (0) to discovery (100)
//[1] -> A number from community (0) to self (100)

const social_media = {
    "BeReal": [5, 5],
    "Facebook": [70, 10],
    "Instagram": [23, 52.5],
    "LinkedIn": [52, 43],
    "Reddit": [58.6, 52.1],
    "Snapchat": [10, 10],
    "TikTok": [20, 20],
    "Tumblr": [30, 30],
    "Twitch": [40, 40],
    "Twitter": [50, 50],
    "YouTube": [60, 60],
    "4Chan": [70, 70],
};


$(function () {
    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
})

function calculate(section) {
    var score = 0;
    $("#" + section + " select").each(function () {
        score += parseFloat($(this).val());
    });
    return score;
}

$("#results-button").click(function () {
    $("#questions").hide();
    $("#results").show();

    const xn = 15;
    const yn = 15;
    const zn = 15;

    var xScore = (xn * 17.533 + calculate("economics")) / (xn * 17.533 * 2) * 100;
    var yScore = (yn * 17.533 + calculate("state")) / (2 *  yn * 17.533) * 100;
    var zScore = (zn * 17.533 + calculate("civil")) / (2 * zn * 17.533) * 100;

    $("#userPin").css("left", "" + xScore + "%");
    $("#userPin").css("top", "" + yScore + "%");
    $("#userBar").css("top", "" + zScore  + "%");

    $("#xScore").text(Math.round(xScore));
    $("#yScore").text(100 - Math.round(yScore));
    $("#zScore").text(100 - Math.round(zScore));

    var closestMedia = closestMedia(xScore, yScore, zScore, []);
    $("#align").text(closestMedia[0] + ", then " + closestMedia[1] + ", then " + closestMedia[2]);
});

function closestMedia(xScore, yScore, zScore, excludes) {
    var smallestMedia = "";
    var smallestMediaDistance = 1000;
    var closestMedia = excludes;

    for (var media in social_media) {
        if (closestMedia.indexOf(media) > -1) {
            continue;
        }
        var scores = social_media[media];
        var d = Math.sqrt(Math.abs(Math.pow(xScore - scores[0], 2) + Math.pow(yScore - scores[1], 2) + Math.pow(zScore - scores[2], 2)));

        if (d < smallestMediaDistance) {
            smallestMediaDistance = d;
            smallestMedia = media;
        }
    }

    closestMedia.push(smallestMedia);
    if (closestMedia.length >= 3) {
        return closestMedia;
    } else {
        return closestMedia(xScore, yScore, zScore, closestMedia);
    }
}

for (var media in social_media) {
    var scores = social_media[media];
    var pin = $("<div/>")
        .addClass("pin")
        .css("left", "" + scores[0] + "%")
        .css("top", "" + scores[1] + "%");

    var i = $("<i/>")
        .addClass("material-icons")
        .attr("data-toggle", "tooltip")
        .attr("title", media);

    mediaNoInt = media.replace(/[0-9]/g, '');
    var a = $("<a/>")
        .addClass(mediaNoInt.toLowerCase())
        .attr("href", media.toLowerCase() + ".html")
        .text("fiber_manual_record");

    i.append(a)

    pin.append(i);
    $("#axes").append(pin);
}