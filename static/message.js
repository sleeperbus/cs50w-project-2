
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("channel"))
        localStorage.setItem("channel", "general")

    channel = localStorage.getItem("channel")

    // get chat data of last visitied channel
    const request = new XMLHttpRequest();
    request.open('POST', '/get_messages');

    // set callback 
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        if (data.success) {
            data.messages.forEach(message => {
                const li = document.createElement("li");
                li.innerHTML = message;
                document.querySelector("#messages").append(li);
            })
        } else {
        }
    }


    // add data to send with request
    const data = new FormData();
    data.append('channel', channel);
    request.send(data);

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        document.querySelector("#message_form").onsubmit = () => {
            const new_message = document.querySelector("#new_message").value;
            document.querySelector("#new_message").value = '';
            socket.emit('submit message', {'channel': channel, 'message': new_message});
            return false;
        }
    })

    socket.on('message everywhere', data => {
        if (channel == data.channel) {
            const li = document.createElement("li");
            li.innerHTML = data.message;
            document.querySelector("#messages").append(li);
        }
    });


})