MongoClient = require('mongodb').MongoClient;
url = "mongodb://localhost:27017/veganDB";
var exports = module.exports = {};

function remove_fields(arr, fieldsList) {
    for (var i = 0; i < arr.length; i++) {
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

function sort_by_location(restsCollection, params) {
    var latitude = params["latitude"];
    var longitude = params["longitude"];
    var mileToKm = 1.609344;
    restsCollection.map(function (rest) {
        if ('location' in rest && rest["rank"] > 5) {
            var distX = longitude - rest.location.longitude;
            var distY = latitude - rest.location.latitude;
            rest["distance"] = parseInt(Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) * mileToKm * 100000, 10);
        }
        else
            rest["distance"] = 999999;
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
                    result = remove_fields(result, ["location", "synonyms", "id", "recs", "_id", "hours", "about"]);
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
