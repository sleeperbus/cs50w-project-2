document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('#submit').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#username').onkeyup = () => {
        if (document.querySelector('#username').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    };

    document.querySelector("#form_new_user").onsubmit = () => {
        const username = document.querySelector("#username").value;
        localStorage.setItem("username", username)

    }
})

