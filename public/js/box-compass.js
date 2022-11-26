const social_media = {
    "Test1": [23, 52.5, 9.7],
    "Test2": [52, 43, 50],
    "Test3": [58.6, 52.1, 32.8],
    "Test4": [25, 60, 41],
    "Test5": [45, 4, 75],
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
        .addClass("mediaPin pin")
        .css("left", "" + scores[0] + "%")
        .css("top", "" + scores[1] + "%");

    var i = $("<i/>")
        .addClass("material-icons")
        .attr("data-toggle", "tooltip")
        .attr("title", media)
        .text("fiber_manual_record");

    pin.append(i);
    $("#axes").append(pin);

    var scalePin = $("<div/>")
        .addClass("mediaBar bar")
        .css("top", "" + scores[2] + "%")
        .attr("data-toggle", "tooltip")
        .attr("title", media);
    $("#scale > div").append(scalePin);
}