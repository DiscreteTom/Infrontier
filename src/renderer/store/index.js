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

const defaultConfig = {
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
  multipartDownloadThreshold: 100,
  multipartDownloadChunkSize: 5,
  /**
   * ```
   * id(string) => {
   *   start: int, // optional, omit when not multipart upload/download
   *   size: int, // optional, omit when not multipart upload/download
   *   uploadId: string, // optional, exist when multipart upload
   *   partNumber: int, // optional, exist when multipart upload
   *   parts: [], // optional, exist when multipart upload
   *   running: false, // all tasks loaded from file are not running
   * }
   * ```
   *
   * `id = [('upload' or 'download'), urlEncode(s3key), urlEncode(localPath)].join('@')`
   */
  tasks: {},
};

export default {
  state() {
    return { ...defaultConfig };
  },
  mutations: {
    /**
     * load config from file
     */
    loadConfig(state, config) {
      // load config
      for (let key in state) {
        if (config[key]) {
          state[key] = config[key];
        }
      }
      // all tasks from file is not running
      Object.keys(state.tasks).map((taskId) => {
        state.tasks[taskId].running = false;
      });
    },
    /**
     * update config & persist config to file
     */
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
    updateTask(state, param) {
      let { id, ...rest } = param;
      state.tasks[id] = rest;
      state.tasks = { ...state.tasks }; // force refresh
      persistConfig(state);
    },
    finishTask(state, { id }) {
      delete state.tasks[id];
      state.tasks = { ...state.tasks }; // force refresh
      persistConfig(state);
    },
    reset(state) {
      for (let key in state) {
        state[key] = defaultConfig[key];
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
    defaultState() {
      return defaultConfig;
    },
  },
};
