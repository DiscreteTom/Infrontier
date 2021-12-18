import { dialog, ipcMain, Notification } from "electron";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import fs, { fstatSync } from "fs";
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
    let taskId = [
      "download",
      encodeURIComponent(arg.key),
      encodeURIComponent(targetFilePath),
    ].join("@");
    event.reply("update-task", {
      id: taskId,
    });

    new Notification({ title: "Downloading", body: `Filename: ${key}` }).show();

    if (!arg.start && arg.size < arg.multipartThreshold * 1024 * 1024) {
      // simple download without multipart
      let ws = fs.createWriteStream(targetFilePath);
      let res = await aws.s3.send(
        new GetObjectCommand({ Bucket: arg.bucket, Key: arg.key })
      );
      res.Body.pipe(ws);
      res.Body.on("end", () => {
        new Notification({
          title: "Downloaded",
          body: `Location: ${targetFilePath}`,
        }).show();
      });
    } else {
      // multipart download
      console.log(`multipart download, chunkSize=${arg.chunkSize}MB`);

      let start = arg.start || 0;
      while (true) {
        let ws = fs.createWriteStream(targetFilePath, { start, flags: "a+" });
        let end = start + arg.chunkSize * 1024 * 1024;
        if (end >= arg.size) end = arg.size - 1;

        console.log(`downloading bytes=${start}-${end}`);

        let res = await aws.s3.send(
          new GetObjectCommand({
            Bucket: arg.bucket,
            Key: arg.key,
            Range: `bytes=${start}-${end}`,
          })
        );
        res.Body.pipe(ws);
        let waiter = new Promise(function (resolve, reject) {
          res.Body.on("end", () => {
            resolve();
          });
          res.Body.on("error", reject);
        });
        await waiter;

        console.log(`finish bytes=${start}-${end}`);

        if (end == arg.size - 1) break;
        start = end + 1;
        event.reply("update-task", {
          id: taskId,
          start,
        });
      }
      new Notification({
        title: "Downloaded",
        body: `Location: ${targetFilePath}`,
      }).show();
      event.reply("finish-task", { id: taskId });
    }
  }
});

ipcMain.on("upload-object", async (event, arg) => {
  new Notification({
    title: "Uploading",
    body: `File: ${arg.localPath}`,
  }).show();
  let taskId = [
    "upload",
    encodeURIComponent(arg.key),
    encodeURIComponent(arg.localPath),
  ].join("@");
  event.reply("update-task", {
    id: taskId,
  });

  let fileSize = fs.statSync(arg.localPath).size;
  if (!arg.start && fileSize <= arg.multipartThreshold * 1024 * 1024) {
    // normal upload without multipart
    let rs = fs.createReadStream(arg.localPath);
    await aws.s3.send(
      new PutObjectCommand({ Bucket: arg.bucket, Key: arg.key, Body: rs })
    );
  } else {
    // multipart upload
    let chunkSize = arg.chunkSize * 1024 * 1024;
    if (chunkSize * 10000 < fileSize) {
      // max part count is 10000
      chunkSize = Math.floor(fileSize / 10000) + 1;
    }

    console.log(`multipart upload, chunk size=${chunkSize}`);

    let uploadId = arg.uploadId;
    let start = arg.start || 0;
    let partNumber = arg.partNumber || 0;
    let parts = arg.parts || [];
    if (!uploadId) {
      // create new multipart upload
      let res = await aws.s3.send(
        new CreateMultipartUploadCommand({ Bucket: arg.bucket, Key: arg.key })
      );
      uploadId = res.UploadId;
      event.reply("update-task", {
        id: taskId,
        start,
        uploadId,
        partNumber,
        parts,
      });
      console.log(`multipart upload created, uploadId=${uploadId}`);
    } else {
      // resume multipart upload
      console.log(
        `multipart upload, resume uploadId=${uploadId}, start=${start}, partNumber=${partNumber}`
      );
    }

    while (true) {
      partNumber++;
      let end = start + chunkSize;
      if (end >= fileSize) end = fileSize - 1;
      let rs = fs.createReadStream(arg.localPath, { start, end });

      console.log(
        `start uploading part ${partNumber}, start=${start}, end=${end}`
      );

      await aws.s3
        .send(
          new UploadPartCommand({
            Bucket: arg.bucket,
            Key: arg.key,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: await streamToBuffer(rs),
          })
        )
        .then((res) => {
          parts.push({ PartNumber: partNumber, ETag: res.ETag });
          console.log(`part ${partNumber} finished`);
        });
      if (end == fileSize - 1) break;
      start = end + 1;
      event.reply("update-task", {
        id: taskId,
        start,
        uploadId,
        partNumber,
        parts,
      });
    }
    await aws.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: arg.bucket,
        Key: arg.key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
    );
  }
  new Notification({
    title: "Uploaded",
    body: `Path: ${arg.key}`,
  }).show();
  event.reply(
    "refresh-folder",
    arg.key.split("/").slice(0, -1).join("/") + "/"
  );
  event.reply("finish-task", { id: taskId });
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
  } else {
    // refresh a normal folder
    event.reply(
      "refresh-folder",
      arg.prefix.split("/").slice(0, -2).join("/") + "/"
    );
  }
});

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
