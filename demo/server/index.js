const express = require("express")
const bodyParser = require("body-parser")
const { Server } = require("socket.io")

const io = new Server({
    cors: true,
});
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()

io.on("connection", (socket) => {
    console.log("new connetion")
    socket.on('join-room', data => {
        const { roomId, emailId } = data;
        console.log("user", emailId, "join room", roomId)
        emailToSocketMapping.set(emailId, socket.id)
        socketToEmailMapping.set(socket.id, emailId)
        socket.join(roomId)
        socket.emit('joined-room', { roomId })
        socket.broadcast.to(roomId).emit('user-joined', { emailId, id: socket.id })
    })
    socket.on('call-user', data => {
        const { emailId, offer } = data
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit("incomming-call", { from: fromEmail, offer, id: socket.id })
    })
    socket.on('call-accepted', data => {
        const { emailId, ans } = data
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted', { ans })
    })

    // socket.on('peer:nego:needed', ({ to, offer }) => {
    //     socket.to(to).emit('peer:nego:needed', { from: socket.id, offer })
    // });

    // socket.on('peer:nego:done', ({ to, ans }) => {
    //     socket.to(to).emit('peer:nego:final', { from: socket.id, ans })
    // });

    socket.on('peer:nego:needed', ({ emailId, offer }) => {
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('peer:nego:needed', { from: fromEmail, offer })
    });

    socket.on('peer:nego:done', ({ emailId, ans }) => {
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('peer:nego:final', { from: socket.id, ans })
    });
});


app.listen(8000, () => console.log("HTTP server running at port 8000"))
io.listen(8001)