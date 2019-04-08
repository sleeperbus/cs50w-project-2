from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)

channels = {'general': ['this is first message', 'this is second message']}


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
    channel = request.form.get("channel")
    last_messages = channels[channel]
    return jsonify({'success': True, 'messages': last_messages})


@socketio.on("submit message")
def send_message(data):
    channel = data['channel']
    message = data['message']
    print('channel and message: {}'.format(",".join([channel, message])))

    if len(channels[channel]) >= 100:
        l.pop(0)
    channels[channel].append(message)
    emit('message everywhere', {'channel': channel, 'message': message}, broadcast=True)


@socketio.on("submit new channel")
def new_channel(data):
    channel = data['channel']
    # channels.setdefault(channel, list())
    if channel not in channels:
        channels[channel] = list()
        emit('new channel', {'channel': channel}, broadcast=True)



