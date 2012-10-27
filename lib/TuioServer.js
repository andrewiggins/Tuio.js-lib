module.exports = (function() {
    var dgram = require("dgram"),
    udpSocket = null,
    socketio = require("socket.io"),
    io = null,
    oscParser = require("./OscParser"),
    debug = false,

    init = function(params) {
        udpSocket = dgram.createSocket("udp4");
        udpSocket.on("listening", onSocketListening);
        udpSocket.on("message", onUdpMessage);
        udpSocket.bind(params.oscPort, params.oscHost);

        io = socketio.listen(params.socketPort);
        io.enable("browser client minification");
        io.enable("browser client etag");
        io.enable("browser client gzip");
        io.set("transports", [
            "websocket",
            "flashsocket",
            "htmlfile",
            "xhr-polling",
            "jsonp-polling"
        ]);
        //io.sockets.on("connection", onSocketConnection);

        debug = params.debug;
        if (debug) {
            console.log("TuioServer Debug:", debug);
        } else {
            io.set("log level", 1);
        }
    },

    onSocketListening = function() {
        var address = udpSocket.address();
        console.log("TuioServer listening on: " + address.address + ":" + address.port);
    },

    onUdpMessage = function(msg) {
        tuiomsg = oscParser.decode(msg);
        if (debug) {
            // indicies 0 and 1 are bundle information
            console.log("TUIO Bundle Received:");
            for (var i = 2; i < tuiomsg.length; i++) {
                console.log("   ", tuiomsg[i].join(' '));
            }
        }
        // Emit message to all listening sockets
        io.sockets.emit("osc", tuiomsg);
    };

    /*
    onSocketConnection = function(socket) {
        udpSocket.on("message", function(msg) {
            tuiomsg = oscParser.decode(msg);
            if (debug) {
                // indicies 0 and 1 are bundle information
                console.log("TUIO Bundle Received:");
                for (var i = 2; i < tuiomsg.length; i++) {
                    console.log("   ", tuiomsg[i].join(' '));
                }
            }
            socket.emit("osc", tuiomsg);
        });
    };
    */

    return {
        init: init
    };
}());
