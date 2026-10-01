/* preload.js, case 4 (extend)*/
//https://qiita.com/pochman/items/62de713a014dcacbad68
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {//rendererからの送信用//
            ipcRenderer.send(channel, data);
        },
        on: (channel, func) => { //rendererでの受信用, funcはコールバック関数//
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
        once: (channel, func) => {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
    }
);
