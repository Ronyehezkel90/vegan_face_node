MongoClient = require('mongodb').MongoClient;
var Utils = require('./utils');

url = "mongodb://localhost:27017/veganDBA";
var exports = module.exports = {};


var getAllCollection = function (params) {
    return new Promise(
        (resolve, reject) => {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection(params["collection"]).find().toArray(function (err, result) {
                    if (err) throw err;
                    result = Utils.add_rank_field(result);
                    if (params["type"] === "location") {
                        result = Utils.sort_by_location(result, params);
                    }
                    result = Utils.remove_fields(result, ["synonyms", "id", "recs", "_id", "hours", "picture"]);
                    result = Utils.slice_response(result, params);
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

var getRestData = function (params) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection("restaurants_data").find({name: params["rest_name"]}).toArray(function (err, result) {
                    if (err) throw err;
                    db.close();
                    if (result) {
                        result = Utils.remove_fields(result, ["recs", "synonyms"]);
                        resolve(result[0]);
                    }
                    else
                        reject('problem')
                });
            });
        }
    );
};

var getPostsByRest = function (params) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection("restaurants_data").find({name: params['rest_name']}).toArray(function (err, rest_result) {
                    if (err) throw err;
                    if (rest_result) {
                        db.collection("posts").find({'id': {$in: Object.keys(rest_result[0].recs)}}).toArray(function (err, posts_result) {
                            if (err) throw err;
                            db.close();
                            if (posts_result) {
                                posts_result = Utils.sort_by_images_and_reactions(posts_result);
                                posts_result = Utils.remove_fields(posts_result, ["place", "_id", "created_time", "attachments"]);
                                posts_result = Utils.limit_posts_response(posts_result);
                                resolve(posts_result);
                            }
                            else
                                reject('problem')
                        });
                    }
                    else
                        reject('problem')
                });
            });
        }
    );
};

var getRestsByQuery = function (params) {
    return new Promise(
        (resolve, reject) => { // fat arrow
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                db.collection("posts").find({'message': new RegExp('^' + params['search_word'])}).toArray(function (err, posts_result) {
                    if (err) throw err;
                    if (posts_result) {
                        db.collection("restaurants_data").find().toArray(function (err, rests_result) {
                            if (err) throw err;
                            db.close();
                            if (rests_result) {
                                rests_result = Utils.add_rank_field(rests_result);
                                rests_result = Utils.sort_by_query(rests_result, posts_result);
                                rests_result = Utils.remove_fields(rests_result, ["synonyms", "id", "recs", "_id", "hours", "picture"]);
                                rests_result = Utils.slice_response(rests_result, params);
                                resolve(rests_result);
                            }
                            else
                                reject('problem')
                        });
                    }
                    else
                        reject('problem')
                });
            });
        }
    );
};

exports.getAllCollection = getAllCollection;
exports.getRestsByQuery = getRestsByQuery;
exports.getRestData = getRestData;
exports.getPostsByRest = getPostsByRest;
