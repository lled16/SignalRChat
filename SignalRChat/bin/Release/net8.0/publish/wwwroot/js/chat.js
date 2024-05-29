"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    const formatedMessage = JSON.parse(message);

    li.innerHTML = `<strong>${user}</strong> : ${formatedMessage.message}`;

    if (formatedMessage.file) {
        const byteArray = new Uint8Array(
            atob(formatedMessage.file)
                .split('')
                .map((char) => char.charCodeAt(0))
        );

        const file = new Blob([byteArray], { type: formatedMessage.type });
        const url = URL.createObjectURL(file);

        const newLi = document.createElement("li");
        document.getElementById("messagesList").appendChild(newLi);
        newLi.innerHTML = `<a href="${url}" download="Arquivo">Dowload: ${formatedMessage.name}</a>`
    }
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

const handleSubmit = (event) => {
    if (event.key && event.key != "Enter") return;


    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    var files = document.getElementById("fileSend").files[0];

    document.getElementsByTagName('input')[0].style.visibility = 'hidden';
    document.getElementById('labelNome').style.visibility = 'hidden';

    if (files) {
        const fileReader = new FileReader();

        fileReader.readAsArrayBuffer(files);

        fileReader.onload = () => {
            var binary = '';
            var bytes = new Uint8Array(fileReader.result);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            const fileA = window.btoa(binary)

            connection.invoke("SendMessage", user, JSON.stringify({
                message, file: fileA, type: files.type, name: files.name
            })).catch(function (err) {
                return console.error(err.toString());
            });
            event.preventDefault();
            document.getElementById("fileSend").value = "";

            /* document.getElementById("userInput").getElementsByTagName("input")[0].setAttribute("visibility", "hidden");*/

        }
        return;
    }

    connection.invoke("SendMessage", user, JSON.stringify({ message })).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
}

document.getElementById("sendButton").addEventListener("click", handleSubmit);

document.getElementById("messageInput").addEventListener("keypress", handleSubmit);

