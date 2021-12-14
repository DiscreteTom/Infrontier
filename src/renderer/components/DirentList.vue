<template>
  <div>
    <v-list nav dense>
      <template v-if="Object.keys(direntsNotEmpty).length">
        <v-list-item
          v-for="(content, path) in direntsNotEmpty"
          :key="path"
          :to="$route.path + path"
        >
          <v-list-item-icon>
            <v-icon>{{
              path.endsWith("/") ? "mdi-folder-outline" : "mdi-file-outline"
            }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              <!-- object name -->
              {{ path }}
              <!-- object size -->
              <v-chip
                v-if="!path.endsWith('/')"
                small
                style="cursor: pointer"
                class="mx-2"
              >
                {{ bytesToSize(content.Size) }}
              </v-chip>
              <!-- last modified time -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-chip
                    v-if="!path.endsWith('/')"
                    small
                    style="cursor: pointer"
                    v-on="on"
                  >
                    {{ timeSince(Date.parse(content.LastModified)) }} ago
                  </v-chip>
                </template>
                <span> ISO: {{ content.LastModified }} </span>
              </v-tooltip>
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action v-if="!path.endsWith('/')" class="my-0 mx-1">
            <tt-btn
              top
              icon="mdi-cloud-download-outline"
              tt="Download"
              @click="saveObject(path)"
            />
          </v-list-item-action>
          <v-list-item-action v-if="!path.endsWith('/')" class="my-0 mx-1">
            <tt-btn
              top
              icon="mdi-delete-outline"
              tt="Delete"
              @click="$emit('delete-object', path)"
            />
          </v-list-item-action>
        </v-list-item>
      </template>
      <template v-else>
        <v-alert color="blue-grey" type="info" dense>
          No objects in this folder.
        </v-alert>
      </template>
    </v-list>
  </div>
</template>

<script>
import TtBtn from "./TtBtn.vue";
import { ipcRenderer } from "electron";

export default {
  components: { TtBtn },
  props: {
    dirents: Object,
  },
  methods: {
    saveObject(path) {
      let key =
        this.$route.path.slice(1) + // remove the leading '/'
        path;
      ipcRenderer.send("save-object", {
        key,
        bucket: this.$store.state.bucketName,
      });
    },
    bytesToSize(bytes) {
      // ref: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
      var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes == 0) return "0 Byte";
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    },
    timeSince(date) {
      // ref: https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
      var seconds = Math.floor((new Date() - date) / 1000);
      var interval = seconds / 31536000;
      if (interval > 1) {
        return Math.floor(interval) + " years";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return Math.floor(interval) + " months";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return Math.floor(interval) + " days";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return Math.floor(interval) + " hours";
      }
      interval = seconds / 60;
      if (interval > 1) {
        return Math.floor(interval) + " minutes";
      }
      return Math.floor(seconds) + " seconds";
    },
  },
  computed: {
    direntsNotEmpty() {
      let result = {};
      for (let path in this.dirents) {
        if (path.length) result[path] = this.dirents[path];
      }
      return result;
    },
  },
};
</script>
