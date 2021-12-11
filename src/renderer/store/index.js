import { ipcRenderer } from "electron";
import { S3Client } from "@aws-sdk/client-s3";

let aws = {};

function persistConfig(state) {
  ipcRenderer.send("update-config", state);
}

/**
 * `path`: `aaa/xxx/`
 */
function getFolder(root, path) {
  let current = root;
  path
    .slice(0, -1) // remove last '/'
    .split("/")
    .forEach((folder) => {
      if (current) current = current[folder + "/"];
    });
  return current;
}

export default {
  state() {
    return {
      bucketName: "",
      profileName: "default",
      /**
       * folderName => dirent (folder or file)
       */
      folders: {},
      defaultEncrypt: "",
    };
  },
  mutations: {
    loadConfig(state, config) {
      for (let key in state) {
        if (config[key]) {
          state[key] = config[key];
        }
      }
    },
    initAws(_, { accessKeyId, secretAccessKey }) {
      aws["s3"] = new S3Client({
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    },
    updateConfig(state, { bucketName, profileName }) {
      state.profileName = profileName;
      state.bucketName = bucketName;
      persistConfig(state);
    },
    updateFolderList(state, { folderNames }) {
      let oldFolders = state.folders;
      state.folders = {};
      folderNames.forEach((name) => {
        state.folders[name] = oldFolders[name] || {};
      });
      persistConfig(state);
    },
    /**
     * `path`: `aaa/xxx/`
     */
    updateFolder(state, { path, content }) {
      let parent;
      if (path.split("/").length == 2) {
        state.folders[path] = content;
      } else {
        let parentPath = path.split("/").slice(0, -2);
        parentPath.push("");
        parentPath = parentPath.join("/");
        parent = getFolder(state.folders, parentPath);
        parent[path.slice(parentPath.length)] = content;
      }
      persistConfig(state);
    },
  },
  getters: {
    /**
     * `path`: `aaa/xxx/`
     */
    folder: (state) => (path) => {
      return getFolder(state.folders, path);
    },
  },
  actions: {
    callAws(_, { service, params }) {
      return aws[service].send(params);
    },
  },
};
