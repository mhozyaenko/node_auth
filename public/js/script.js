var port = 3000;
var socket = io.connect('http://localhost:' + port);
var userInfo = {};

$(document).ready(function () {

    $('.submitReg').on('click', function (e) {
        e.preventDefault();
        userInfo.name = $('.username').val();
        userInfo.pass = $('.password').val();
        socket.emit("user", userInfo);
    });
    socket.on('reg', function (name) {
        alert("you're registered, "+name);
    });
    socket.on("noRegister", function (data) {
        alert("ERROR! user "+data+" exists")
    });
    $('.submitAuth').on('click', function (e) {
        e.preventDefault();
        userInfo.name = $('.username').val();
        userInfo.pass = $('.password').val();
        socket.emit("checkUser", userInfo);
    });
    socket.on("authorized", function (name) {
        alert("congrats, " + name + " authorized")
    });
    socket.on("wrongPass", function (name) {
        alert("ERROR!! " + name + ", wrong password")
    });
    socket.on("noUser", function (name) {
        alert("ERROR!! " + name + " does not exist. Register!")
    });
})
