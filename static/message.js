
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("channel"))
        localStorage.setItem("channel", "general")

    var current_channel = localStorage.getItem("channel")
    const username = localStorage.getItem("username")

    // get chat data of last visitied channel
    const req_messgae_history = new XMLHttpRequest();
    req_messgae_history.open('POST', '/get_messages');

    // set callback 
    req_messgae_history.onload = () => {
        const data = JSON.parse(req_messgae_history.responseText);
        if (data.success) {
            data.messages.forEach(data => {
                const li = document.createElement("li");
                li.innerHTML = `${data.username} : ${data.message}`;
                if (data.username == username)
                    li.className = "me";
                else
                    li.className = "others";

                document.querySelector("#messages").append(li);
            })
        } else {
        }
    }

    // add data to send with req_messgae_history
    const data = new FormData();
    data.append('channel', current_channel);
    req_messgae_history.send(data);



    // set chatting application 
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        // send message
        document.querySelector("#message_form").onsubmit = () => {
            const new_message = document.querySelector("#new_message").value;
            document.querySelector("#new_message").value = '';
            socket.emit('submit message', {'channel': current_channel, 'message': new_message, 'username': username});
            return false;
        }

        // create new channel
        document.querySelector("#channel_form").onsubmit = () => {
            const new_channel = document.querySelector("#new_channel").value;
            document.querySelector("#new_channel").value = '';
            socket.emit('submit new channel', {'channel': new_channel});
            return false;
        }
    })

    // receive new message
    socket.on('message everywhere', data => {
        if (current_channel == data.channel) {
            const li = document.createElement("li");
            li.innerHTML = `${data.username} : ${data.message}`; 
            if (data.username == username)
                li.className = "me";
            else
                li.className = "others";

            document.querySelector("#messages").append(li);
        }
    });

    // receive new channel
    socket.on('new channel', data => {
        const li = document.createElement("li");
        li.innerHTML = `<a href='#${data.channel}'>${data.channel}</a>`;
        document.querySelector("#channel-list").append(li);
    });


})