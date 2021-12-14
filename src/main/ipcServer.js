import { dialog, ipcMain, Notification } from "electron";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mainWindow from "./mainWindow";

const CONFIG_FILE = "config.json";
const s3 = new S3Client();

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

ipcMain.on("save-object", async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow.browserWindow, {
    properties: ["openDirectory"],
  });
  if (!result.canceled) {
    let key = arg.key;
    let filename = key.split("/").at(-1);
    let folderPath = result.filePaths[0];
    let targetFilePath = folderPath + path.sep + filename;

    new Notification({ title: "Downloading", body: `Filename: ${key}` }).show();
    s3.send(new GetObjectCommand({ Bucket: arg.bucket, Key: arg.key })).then(
      (res) => {
        let ws = fs.createWriteStream(targetFilePath);
        res.Body.pipe(ws);
        res.Body.on("end", () => {
          new Notification({
            title: "Downloaded",
            body: `Location: ${targetFilePath}`,
          }).show();
        });
      }
    );
  }
});
