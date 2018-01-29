MongoClient = require('mongodb').MongoClient;
url = "mongodb://localhost:27017/veganDB";
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

var getAllCollection = function (params) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection(params["collection"]).find().toArray(function (err, result) {
                    if (err) throw err;
                    result = add_rank_field(result);
                    if (params["type"] === "location") {
                        result = sort_by_location(result, params);
                    }
                    result = remove_fields(result, ["synonyms", "id", "recs", "_id", "hours", "picture"]);
                    result = slice_response(result, params);
                    db.close();
                    if (result)
                        resolve(result);
                    else
                        reject('problem')
                });
            });
        }
    );
};

// Promise
var getRestData = function (restObj) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection("restaurants_data").find({name: restObj['rest_name']}).toArray(function (err, result) {
                    if (err) throw err;
                    db.close();
                    if (result) {
                        result = remove_fields(result, ["recs", "synonyms"]);
                        resolve(result[0]);
                    }
                    else
                        reject('problem')
                });
            });
        }
    );
};


exports.getAllCollection = getAllCollection;
exports.getRestData = getRestData;
