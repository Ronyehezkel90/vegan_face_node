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

var getAllCollection = function (params) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection(params["collection"]).find().toArray(function (err, result) {
                    if (err) throw err;
                    for (var i = 0; i < result.length; i++) {
                        result[i]["rank"] = Object.keys(result[i]["recs"]).length;
                    }
                    result.sort(function (a, b) {
                        return (a.rank > b.rank) ? -1 : ((b.rank > a.rank) ? 1 : 0);
                    });
                    result = remove_fields(result, ["synonyms", "id", "recs", "_id", "hours", "about"]);
                    var from = params["page"] * params["rests_amount"];
                    var to = from + 10;
                    result = result.slice(from, to);
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

// exports.getAllCollection = async function getAllCollection(collectionName) {
//     MongoClient.connect(url, function (err, db) {
//         if (err) throw err;
//         db.collection(collectionName).find().toArray(function (err, result) {
//             if (err) throw err;
//             for (var i = 0; i < result.length; i++) {
//                 result[i]["rank"] = Object.keys(result[i]["recs"]).length;
//             }
//             result.sort(function (a, b) {
//                 return (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0);
//             });
//             var fieldsToRemove = ["synonyms", "id", "recs", "_id", "hours"];
//             for (var i = 0; i < result.length; i++) {
//                 fieldsToRemove.forEach(function (field) {
//                     delete result[i][field];
//                 });
//             }
//             db.close();
//             return result;
//         });
//     });
// };

// exports.getAllCollection("restaurants_data").then(function (val) {
//     console.log(val);
// });
