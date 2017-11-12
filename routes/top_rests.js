var express = require('express');
var router = express.Router();

/* GET users listing. */
var path;
var local=false;
if (local){
    path = "/home/ron/PycharmProjects/vegan_face/router.py";
}
else {
    //todo: Change path to git path
    path = "/home/ec2-user/vegan_face_python/router.py";
}
router.get('/', function (req, res, next) {
    console.log("top_rests requests has been sent");
    // for python script
    var spawn = require("child_process").spawn;
    var query = req.query.q;
    var process = spawn('python', [path, "get_top_rests", query]);
    // Write the content of the file to response body
    process.stdout.on('data', function (data) {
        res.send(data.toString())
    });
});

module.exports = router;
