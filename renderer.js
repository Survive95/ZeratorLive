const { shell, ipcRenderer } = require("electron");

let alreadyOn = 0
checkStream()

setInterval(function () {
    checkStream()
}, 30000);

function checkStream() {
    let XML1 = new XMLHttpRequest()
    XML1.open("POST", "https://id.twitch.tv/oauth2/token?client_id=qod6dds740bwldj4zi4wyf1l7nqp76&client_secret=xssnymqljly6m9x1zvoxluwctheklo&grant_type=client_credentials", true)
    XML1.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let token = JSON.parse(XML1.responseText)

            let XML = new XMLHttpRequest()

            XML.open("GET", "https://api.twitch.tv/helix/streams/?user_login=zerator")
            XML.setRequestHeader('Client-ID', 'qod6dds740bwldj4zi4wyf1l7nqp76')
            XML.setRequestHeader("Authorization", "Bearer " + token["access_token"]);
            XML.onreadystatechange = function () {

                if (XML.readyState == 4) {
                    let data = JSON.parse(XML.responseText)
                    if (data.data == "") {
                        ipcRenderer.send('offline', 'offline')
                        alreadyOn = 0
                    }
                    else {
                        ipcRenderer.send('game', data.data[0].game_name)
                        if (alreadyOn == 0) {
                            let gameName = data.data[0].game_name
                            ipcRenderer.send('online', gameName)

                            const notifs = new Notification('🔴 Zerator', {
                                body: `Zerator joue à ${data.data[0].game_name}`,
                                icon: __dirname + "/src/build.ico",
                                requireInteraction: true
                            })

                            notifs.onclick = () => {
                                shell.openExternal('https://www.twitch.tv/zerator')
                            }

                            alreadyOn = 1
                        }
                    }
                }
            }
            XML.send()
        }
    }
    XML1.send()
}
