var express = require('express');
var router = express.Router();
var mongo_handler = require('../mongo_handler');
/* GET users listing. */
var path;
var python_version;
var local = false;
if (local) {
    path = "/home/ron/PycharmProjects/vegan_face/router.py";
    python_version = 'python'
}
else {
    //todo: Change path to git path
    path = "/home/ubuntu/vegan_app/vegan_face_python/router.py";
    python_version = 'python2.7'
}
const func = "func";
const params = "params";
const required = "required";

const functions_dict = {
    'get_top_rests': {
        func: mongo_handler.getAllCollection,
        required: [{"collection": "restaurants_data"}, {"rests_amount": 50}],
        params: ["page", "type", "latitude", "longitude"]
    },
    'get_rests_by_query': {
        func: mongo_handler.getRestsByQuery,
        required: [{"collection": "restaurants_data"}, {"rests_amount": 50}],
        params: ["page", "search_word"]
    },
    'get_rest_data': {func: mongo_handler.getRestData, required: [], params: ["rest_name"]},
    'get_posts': {func: mongo_handler.getPostsByRest, required: [], params: ["rest_name"]}

};
router.get('/', function (req, res, next) {
    var query = req.query.q;
    var paramsAndRequires = {};
    functions_dict[query][required].forEach(function (require) {
        paramsAndRequires[Object.keys(require)[0]] = Object.values(require)[0];
    });
    functions_dict[query][params].forEach(function (param) {
        paramsAndRequires[param] = req.query[param];

    });
    functions_dict[query][func](paramsAndRequires)
        .then(ans => res.send(ans))
        .catch(error => console.log(error.message));

});
module.exports = router;
