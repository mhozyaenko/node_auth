var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;
const mongoose = require("mongoose");
const crypto = require("crypto");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/chat2", {
    useNewUrlParser:true
}).then(() => console.log('connect')).catch(e => console.log(e));
Schema = mongoose.Schema;
const schema = new Schema ({
    username:{
        type:String,
        unique:true,
        required:true
    },
    hashedPassword:{
        type:String,
        required:true
    },
    salt:{
        type:String,
        required:true
    }
});
schema.methods.encryptPassword=function(password){
    return crypto.createHmac("sha1", this.salt).update(password).digest('hex');
};
schema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = Math.random(1000000)+'';
        this.hashedPassword=this.encryptPassword(password)
    })
    .get(()=>{return this._plainPassword});
schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password)==this.hashedPassword;
}
schema.query.byName = function (name) {
    return this.where({ username: new RegExp(name, 'i') });
}
server.listen(port);
app.use(express.static(__dirname+'/public'));
const User = mongoose.model('User', schema);
io.on('connection', function (socket) {
    socket.on("user", function (userInfo) {
        const user = new User({
            username: userInfo.name,
            password: userInfo.pass
        });
    User.findOne().byName(user.username).exec(function(err, res){
       if(res) {
           io.sockets.emit("noRegister", user.username)
       } else {
           user.save(function(err, user) {
               if (err) throw err;
               io.sockets.emit('reg', user.username);
           })
       }
    });
    });
    socket.on("checkUser", function (userInfo) {
        User.findOne().byName(userInfo.name).exec(function(err, res) {
            if(res) {
                var hashedPass = crypto.createHmac("sha1", res.salt).update(userInfo.pass).digest('hex')
                if(hashedPass == res.hashedPassword) {
                    io.sockets.emit("authorized", userInfo.name)
                } else {
                    io.sockets.emit("wrongPass", userInfo.name)
                }
            } else {
                io.sockets.emit("noUser", userInfo.name)
            }
        })
    })

});

