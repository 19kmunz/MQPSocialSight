//TODO: Get this from Mongo
//[0] -> A number from agency (0) to discovery (100)
//[1] -> A number from community (0) to self (100)

const social_media = {
    "BeReal": [5, 5, "https://upload.wikimedia.org/wikipedia/en/4/40/BeReal_logo.png"],
    "Facebook": [70, 10, "https://play-lh.googleusercontent.com/ccWDU4A7fX1R24v-vvT480ySh26AYp97g1VrIB_FIdjRcuQB2JP2WdY7h_wVVAeSpg=w240-h480"],
    "Instagram": [23, 52.5, "https://play-lh.googleusercontent.com/LM9vBt64KdRxLFRPMpNM6OvnGTGoUFSXYV-w-cGVeUxhgFWkCsfsPSJ5GYh7x9qKqw=w240-h480"],
    "LinkedIn": [52, 43, "https://play-lh.googleusercontent.com/kMofEFLjobZy_bCuaiDogzBcUT-dz3BBbOrIEjJ-hqOabjK8ieuevGe6wlTD15QzOqw=w240-h480"],
    "Reddit": [58.6, 52.1, "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Reddit_icon.svg/2048px-Reddit_icon.svg.png"],
    "Snapchat": [10, 10, "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo=w240-h480"],
    "TikTok": [20, 20, "https://play-lh.googleusercontent.com/OS-MhSWOPtlUZLt0_UP5TI4juSf0XhyHxGfJa6pA-UIYkZ1BB6QHTZwaMEzZDPqYsmk=w240-h480"],
    "Tumblr": [30, 30, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Tumblr.svg/2048px-Tumblr.svg.png"],
    "Twitch": [40, 40, "https://nordgamesllc.com/wp-content/uploads/2020/12/app-icons-twitch.png"],
    "Twitter": [50, 50, "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Twitter2.svg/2048px-Twitter2.svg.png"],
    "YouTube": [60, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/640px-YouTube_social_white_square_%282017%29.svg.png"],
    "4Chan": [70, 70, "https://www.betterinternetforkids.eu/documents/167024/f518af98-d19e-462f-acca-83d217f0e208"],
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

for (var mediaData in social_media) {
    var scores = social_media[mediaData];
    var pin = $("<div/>")
        .addClass("pin")
        .css("left", "" + scores[0] + "%")
        .css("top", "" + scores[1] + "%");

    var i = $("<i/>")
        .addClass("material-icons")
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