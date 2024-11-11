const socket = io('/');

let userName = '';

const getUserName = () => {
    userName = localStorage.getItem('username');
    if (userName) {
        document.getElementById('user').innerText = userName;
        localStorage.setItem('username', userName);
    } else {
        console.log('Whats your name then?', userName);
        window.location.href = '';
    }
}

const initSocketEventListeners = () => {
    socket.emit('newUser', {
        user: userName,
        chat: window.location.href.split('/').pop() 
    });
    
    socket.on('newUser', (data) => {
        sendNewUserMessage(data.user);
    });
    
    socket.on('newMessage', (data) => {
        sendNewMessage(data);
    });
    
    socket.on('userLeft', (data) => {
        sendUserLeftMessage(data.user);
    });
}

const sendNewUserMessage = (name) => {
    const p = document.createElement('p');
    p.className = 'new-user';
    p.innerText = `${name} joined the chat`;
    document.getElementById('messages').append(p);
}

const sendUserLeftMessage = (name) => {
    const p = document.createElement('p');
    p.className = 'user-left';
    p.innerText = `${name} left the chat`;
    document.getElementById('messages').append(p);
}

const sendNewMessage = (data, mine) => {
    const p = document.createElement('p');
    let name = data.user;
    if (mine) {
        p.className = 'message mine';
        name = 'You';
    } else {
        p.className = 'message';
    }

    p.innerHTML = `<span>${name}</span><p>${data.message}</p>`;
    p.id = new Date().getTime();
    document.getElementById('messages').append(p);  
    document.getElementById(p.id).scrollIntoView();
}

const initMessageForm = () => {
    document.getElementsByTagName('form')[0].addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementsByTagName('input')[0];
        const message = input.value;
        if (!message) return;
        sendNewMessage({ message }, true);
        socket.emit('newMessage', {
            user: userName,
            message
        });
    
        input.value = '';
    });
}

// Init
(() => {
    getUserName();
    initSocketEventListeners();
    initMessageForm();
    sendNewUserMessage('You'); 

    window.onbeforeunload = () => {
        return 'Are you sure you want to leave?';
    };
})();