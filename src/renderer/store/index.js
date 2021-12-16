import { ipcRenderer } from "electron";

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
      region: "us-east-1",
      profile: "default",
      /**
       * folderName => dirent (folder or file)
       */
      folders: {},
      defaultEncrypt: "",
      multipartUploadThreshold: 100,
      multipartUploadChunkSize: 5,
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
    updateConfig(state, config) {
      for (let key in state) {
        if (config[key]) {
          state[key] = config[key];
        }
      }
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
};
