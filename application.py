from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)

channels = {'general': [{'username': 'test_user1', 'message': 'this is first message'}]}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/add_user", methods=["POST"])
def add_user():
    username = request.form.get('username')
    if not username:
        return redirect(url_for("register"))
    else:
        return redirect(url_for("message"))


@app.route("/message")
def message():
    return render_template("message.html", channels=list(channels.keys()))


@app.route("/get_messages", methods=["POST"])
def get_messages():
    """
    return all recent messages with selected channel
    """
    channel = request.form.get("channel")
    if channel in channels:
        last_messages = channels[channel]
        return jsonify({'success': True, 'messages': last_messages})
    else:
        return jsonify({'success': False})

@app.route("/all_channels", methods=["POST"])
def all_channels():
    """
    return channel names
    """
    return jsonify({'success': True, 'channels': list(channels.keys())})

@socketio.on("submit message")
def send_message(data):
    """
    send message to everywhere
    """
    channel = data['channel']
    message = data['message']
    username = data['username']
    # print('channel and message: {}'.format(",".join([channel, message])))

    if len(channels[channel]) >= 100:
        channel[channel].pop(0)
    channels[channel].append({'username': username, 'message': message})
    emit('message everywhere', {'channel': channel, 'message': message, 'username': username}, broadcast=True)


@socketio.on("submit new channel")
def new_channel(data):
    """
    create channel and send everywhere
    """
    channel = data['channel']
    # channels.setdefault(channel, list())
    if channel not in channels:
        channels[channel] = list()
        emit('new channel', {'channel': channel}, broadcast=True)

