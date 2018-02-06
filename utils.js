var exports = module.exports = {};


function remove_fields(arr, fieldsList) {
    for (var i = 0; i < arr.length; i++) {
        if ("picture" in arr[i]) {
            arr[i]["pic_url"] = arr[i]["picture"]["data"]["url"]
        }
        fieldsList.forEach(function (field) {
            delete arr[i][field];
        });
    }
    return arr;
}

function add_rank_field(restsCollection) {
    for (var i = 0; i < restsCollection.length; i++) {
        restsCollection[i]["rank"] = Object.keys(restsCollection[i]["recs"]).length;
    }
    restsCollection.sort(function (a, b) {
        return (a.rank > b.rank) ? -1 : ((b.rank > a.rank) ? 1 : 0);
    });
    return restsCollection;
}

function slice_response(restsCollection, params) {
    var from = params["page"] * params["rests_amount"];
    var to = from + params["rests_amount"];
    return restsCollection.slice(from, to);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return parseInt(d * 1000, 10);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function sort_by_location(restsCollection, params) {
    var latitude = params["latitude"];
    var longitude = params["longitude"];
    restsCollection.map(function (rest) {
        if ('location' in rest && rest["rank"] > 5)
            rest["distance"] = getDistanceFromLatLonInKm(latitude, longitude, rest.location.latitude, rest.location.longitude);
        else
            rest["distance"] = 9999999;
        return rest;
    });
    restsCollection.sort(function (a, b) {
        return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
    });
    return restsCollection;

}

function getReactionsCount(post) {
    return "reactions" in post ? Object.values(post.reactions).reduce((a, b) => a + b, 0) : 0;
}

function getImagesUrls(post) {
    var imgUrls = [];
    if ("attachments" in post) {
        if ("subattachments" in post.attachments.data["0"])
            post.attachments.data["0"].subattachments.data.map(function (attachment) {
                if (attachment.type === "photo") imgUrls.push(attachment.media.image.src);
            });
        else
            post.attachments.data.map(function (attachment) {
                if (attachment.type === "photo") imgUrls.push(attachment.media.image.src);
            });
    }
    return imgUrls;
}

function sort_by_images_and_reactions(postsList) {
    postsList.map(function (post) {
        post["imgUrls"] = getImagesUrls(post);
        post["reactionsCount"] = getReactionsCount(post);
        return post;
    });
    postsList.sort(function (a, b) {
        return (a["imgUrls"].length > b["imgUrls"].length) ? -1 : ((b["imgUrls"].length > a["imgUrls"].length) ? 1 : ((a["reactionsCount"] > b["reactionsCount"]) ? -1 : ((b["reactionsCount"] > a["reactionsCount"]) ? 1 : 0)));
    });
    return postsList;
}

function limit_posts_response(postsList) {
    postsList.map(function (post) {
        post["imgUrls"] = post["imgUrls"].slice(0, 3);
        if (post["message"])
            post["message"] = post["message"].slice(0, 100);
        return post;
    });
    return postsList;
}


exports.sort_by_location = sort_by_location;
exports.remove_fields = remove_fields;
exports.add_rank_field = add_rank_field;
exports.slice_response = slice_response;
exports.sort_by_images_and_reactions = sort_by_images_and_reactions;
exports.limit_posts_response = limit_posts_response;
