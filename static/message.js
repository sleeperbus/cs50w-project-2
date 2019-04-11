if (!localStorage.getItem("channel"))
    localStorage.setItem("channel", "general")

var current_channel = localStorage.getItem("channel")
const username = localStorage.getItem("username")

// clear message section
function clear_message_section() {
    var messages = document.getElementById("messages")
    while (messages.hasChildNodes()) {
        messages.removeChild(messages.firstChild)
    }
}

// new message to channel
function append_message_to_channel(data) {
    const li = document.createElement("li");
    li.innerHTML = `${data.username} : ${data.message}`;
    if (data.username == username)
        li.className = "me";
    else
        li.className = "others";

    document.querySelector("#messages").append(li);
}

// recent channel messages
function get_channel_message(channel) {
    // get chat data of last visitied channel
    const req_messgae_history = new XMLHttpRequest();
    req_messgae_history.open('POST', '/get_messages');

    // set callback 
    req_messgae_history.onload = () => {
        clear_message_section();
        const data = JSON.parse(req_messgae_history.responseText);
        if (data.success) {
            data.messages.forEach(single_data => {
                append_message_to_channel(single_data)
            })
        } 
    }

    // add data to send with req_messgae_history
    const data = new FormData();
    data.append('channel', channel);
    req_messgae_history.send(data);
}

// get all channel names
function get_channels() {
    let req_channels = new XMLHttpRequest();
    req_channels.open("POST", "/all_channels");

    req_channels.onload = () => {
        let data = JSON.parse(req_channels.responseText)        
        if (data.success) {
            data.channels.forEach(channel => {
                create_new_channel(channel)
            })
            activate_channel(current_channel);
        }
    }
    req_channels.send();
}


// new channel
function create_new_channel(new_channel) {
    const li = document.createElement("li");
    li.innerHTML = `<a href='#${new_channel}' data-channel=${new_channel} class="channel">${new_channel}</a>`;
    li.onclick = () => {
        current_channel = new_channel;
        localStorage.setItem("channel", current_channel);
        activate_channel(current_channel);
        get_channel_message(current_channel);
    }

    document.querySelector("#channel-list").append(li);
}

// activate channel 
function activate_channel(selected_channel) {
    document.querySelectorAll(".channel, .selected_channel").forEach(channel => {
        if (selected_channel == channel.dataset.channel) {
            channel.className = "selected_channel";
        } else {
            channel.className = "channel";
        }
    })
}


document.addEventListener("DOMContentLoaded", () => {
    // get chat data of last visitied channel

    get_channels();
    get_channel_message(current_channel);

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
            current_channel = new_channel;
            document.querySelector("#new_channel").value = '';
            // send everywhere
            localStorage.setItem("channel", current_channel);
            socket.emit('submit new channel', {'channel': current_channel});
            return false;
        }
    })

    // receive new message
    socket.on('message everywhere', data => {
        if (current_channel == data.channel) {
            append_message_to_channel(data)
        }
    });

    // receive new channel 
    socket.on('new channel', data => {
        create_new_channel(data.channel);
        if (data.channel == current_channel) {
            activate_channel(current_channel);
            get_channel_message(current_channel);
        }



    });
})