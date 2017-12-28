var express = require('express');
var router = express.Router();

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
router.get('/', function (req, res, next) {
    console.log("request has been sent");
    // for python script
    var spawn = require("child_process").spawn;
    var query = req.query.q;
    console.log("query is: " + query);
    var process = null;
    if ('rest' in req.query) {
        process = spawn(python_version, [path, query, req.query['page'], req.query['rest']]);
    }
    else if ('rank' in req.query) {
        process = spawn(python_version, [path, query, req.query['post_id'], req.query['rank']]);
    }
    else if (query === 'get_top_rests') {
        process = spawn(python_version, [path, query, req.query['page']]);
    }
    else {
        process = spawn(python_version, [path, query]);
    }
    // Write the content of the file to response body
    process.stdout.on('data', function (data) {
        console.log(data);
        res.send(data.toString());
    });
});

module.exports = router;
