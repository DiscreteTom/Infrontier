import { dialog, ipcMain, Notification } from "electron";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mainWindow from "./mainWindow";

const CONFIG_FILE = "config.json";
let aws = {};

ipcMain.on("get-aws-credentials", (event, arg) => {
  defaultProvider({ profile: arg.profile || "default" })().then((res) => {
    aws["s3"] = new S3Client({
      credentials: res,
      region: arg.region,
    });
    event.reply("get-aws-credentials", res);
  });
});

ipcMain.on("load-config", (event, arg) => {
  fs.readFile(CONFIG_FILE, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      // if no config file
      let defaultConfig = {
        bucketName: "",
        profile: "default",
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
    aws.s3
      .send(new GetObjectCommand({ Bucket: arg.bucket, Key: arg.key }))
      .then((res) => {
        let ws = fs.createWriteStream(targetFilePath);
        res.Body.pipe(ws);
        res.Body.on("end", () => {
          new Notification({
            title: "Downloaded",
            body: `Location: ${targetFilePath}`,
          }).show();
        });
      });
  }
});

ipcMain.on("upload-object", async (event, arg) => {
  let rs = fs.createReadStream(arg.localPath);
  new Notification({
    title: "Uploading",
    body: `File: ${arg.localPath}`,
  }).show();
  aws.s3
    .send(new PutObjectCommand({ Bucket: arg.bucket, Key: arg.key, Body: rs }))
    .then((res) => {
      new Notification({
        title: "Uploaded",
        body: `Path: ${arg.key}`,
      }).show();
    });
});

ipcMain.on("delete-folder", async (event, arg) => {
  new Notification({
    title: "Deletion started",
    body: `Folder: ${arg.prefix}`,
  }).show();
  while (true) {
    // res will contain less than 1000 objects
    let res = await aws.s3.send(
      new ListObjectsV2Command({
        Bucket: arg.bucket,
        Prefix: arg.prefix,
      })
    );
    if (!res.Contents || !res.Contents.length)
      // no more objects
      break;

    let targets = [];
    res.Contents.map((obj) => {
      targets.push({ Key: obj.Key });
    });
    await aws.s3.send(
      new DeleteObjectsCommand({
        Bucket: arg.bucket,
        Delete: {
          Objects: targets,
        },
      })
    );
  }
  new Notification({
    title: "Deletion completed",
    body: `Folder: ${arg.prefix}`,
  }).show();

  if (arg.prefix.split("/").length == 2) {
    // this is a top level folder
    event.reply("refresh-folder-list", "");
  }
});
