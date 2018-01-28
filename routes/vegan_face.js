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
        params: ["page"]
    },
    'get_rest_data': {func: mongo_handler.getRestData, required: [], params: ["rest_name"]}
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

// router.get('/', function (req, res, next) {
//     console.log("request has been sent");
//     // for python script
//     var spawn = require("child_process").spawn;
//     var query = req.query.q;
//     console.log("query is: " + query);
//     var process = null;
//     if ('rest' in req.query) {
//         process = spawn(python_version, [path, query, req.query['page'], req.query['rest']]);
//     }
//     else if ('rank' in req.query) {
//         process = spawn(python_version, [path, query, req.query['post_id'], req.query['rank']]);
//     }
//     else if (query === 'get_top_rests') {
//         // process = spawn(python_version, [path, query, req.query['page'], req.query['prop']]);
//         res.send(mongo_handler.getAllCollection("restaurants_data"));
//     } else if (query === 'get_rest_data') {
//         process = spawn(python_version, [path, query, req.query['rest_field'], req.query['rest_name']]);
//     }
//     else {
//         process = spawn(python_version, [path, query]);
//     }
//     // Write the content of the file to response body
//     process.stdout.on('data', function (data) {
//         console.log(data.toString());
//         res.send(data);
//     });
// });

module.exports = router;
