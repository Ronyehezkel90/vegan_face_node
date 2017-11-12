module.exports = {
    apps: [{
        name: 'vegan_face',
        script: './app.js'
    }],
    deploy: {
        production: {
            user: 'ubuntu',
            host: 'ec2-52-38-146-13.us-west-2.compute.amazonaws.com',
            key: '~/.ssh/MyKeyPair.pem',
            ref: 'origin/master',
            repo: 'git@github.com:Ronyehezkel90/vegan_face_node.git',
            path: '/home/ubuntu/vegan_face',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
        }
    }
}