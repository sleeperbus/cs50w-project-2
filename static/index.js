// redirect new user to register page
if (!localStorage.getItem("username"))
    // window.location.replace("localhost:5000/register")
    window.location.replace("http://sleeperbus.net:8888/register")
else
    // window.location.replace("localhost:5000/message")
    window.location.replace("http://sleeperbus.net:8888/message")


