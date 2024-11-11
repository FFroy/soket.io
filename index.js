const express = require('express');
const socketIo = require('socket.io');

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static(__dirname + '/public'));

const rooms = [
    { id: '1', name: 'Room One' },
    { id: '2', name: 'Room Two' },
    { id: '3', name: 'Room Three' },
    { id: '4', name: 'Room Four' }
];

app.get('/api/rooms', (req, res) => {
    res.send(rooms);
});

app.get('/chat/:id', (req, res) => {
    const chatId = req.params.id;
    const room = rooms.filter(item => item.id === chatId);
    if (!room.length) res.redirect('/');

    res.sendFile(__dirname + '/views/chat.html');
})

const server = app.listen(port, () => {
    console.log('app running in port ' + port);
});

const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A new user connected');

    socket.on('newUser', (data) => { 
        socket.data.user = data.user; 
        socket.data.chat = data.chat;
        socket.join('chat-' + data.chat);

        socket.to('chat-' + data.chat).emit('newUser', data); 
    });

    socket.on('newMessage', (data) => { 
        socket.to('chat-' + socket.data.chat).emit('newMessage', data); 
    });

    socket.on('disconnect', () => {
        socket.to('chat-' + socket.data.chat).emit('userLeft', { ...socket.data });
    })
})