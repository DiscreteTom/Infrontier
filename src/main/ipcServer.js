import { ipcMain } from "electron";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import fs from "fs";

const CONFIG_FILE = "config.json";

ipcMain.on("get-aws-credentials", (event, arg) => {
  defaultProvider()().then((res) => {
    event.reply("get-aws-credentials", res);
  });
});

ipcMain.on("load-config", (event, arg) => {
  fs.readFile(CONFIG_FILE, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      // if no config file
      let defaultConfig = {
        bucketName: "",
        profileName: "default",
        folders: [],
        defaultEncrypt: "",
      };
      // generate default config file
      fs.writeFile(
        CONFIG_FILE,
        JSON.stringify(defaultConfig),
        "utf-8",
        () => {}
      );
      // reply default value
      event.reply("load-config", defaultConfig);
    } else {
      event.reply("load-config", JSON.parse(data));
    }
  });
});

ipcMain.on("update-config", (event, arg) => {
  fs.writeFile(CONFIG_FILE, JSON.stringify(arg), "utf-8", () => {});
});
