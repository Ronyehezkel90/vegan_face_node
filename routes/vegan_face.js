var express = require('express');
var router = express.Router();

/* GET users listing. */
var path;
var local = false;
if (local) {
    path = "/home/ron/PycharmProjects/vegan_face/router.py";
}
else {
    //todo: Change path to git path
    path = "/home/ubuntu/vegan_app/vegan_face_python/temp_test.py";
}
router.get('/', function (req, res, next) {
    console.log("request has been sent");
    // for python script
    var spawn = require("child_process").spawn;
    var query = req.query.q;
    console.log("query is: " + query);
    var process = null;
    if ('rest' in req.query) {
        process = spawn('python', [path, query, req.query['rest']]);
    }
    else {
        console.log("1");
        process = spawn('python', [path, query]);
        console.log("2");

    }
    // Write the content of the file to response body
    process.stdout.on('data', function (data) {
        console.log("3");
        console.log(data);
        res.send(data.toString());
        console.log("4");

    });
});

module.exports = router;
