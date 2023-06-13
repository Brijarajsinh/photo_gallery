module.exports = function (server) {
    try {
        //declaring global io variable to use in different files of application
        global.io = require('socket.io')(server);

        //connection method of socket.io to join client in particular room
        io.on('connection', (socket) => {
            //socket join with a room passed as a query.RoomID
            socket.join(socket.handshake.query.RoomID);
        });

    } catch (error) {

        //if error generated while joining room
        console.log("Error Generated to connect admin in socket room");
        console.log(error);
    }
}