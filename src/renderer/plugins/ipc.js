import { ipcRenderer } from "electron";

let channelMap = {};

let ipc = {
  /**
   * every channel can only has one listener
   */
  one(channel, f) {
    if (Object.keys(channelMap).indexOf(channel) == -1) {
      ipcRenderer.on(channel, (event, arg) => {
        channelMap[channel](event, arg);
      });
    }
    channelMap[channel] = f;
  },
  send(channel, ...arg) {
    ipcRenderer.send(channel, ...arg);
  },
};

export default (context, inject) => {
  inject("ipc", ipc);
};
