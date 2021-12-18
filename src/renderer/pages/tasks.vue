<template>
  <div>
    <v-list nav dense>
      <template v-if="Object.keys($store.state.tasks).length">
        <v-list-item v-for="(value, key) in $store.state.tasks" :key="key">
          <v-list-item-icon>
            <v-icon>{{
              key.split("@")[0] == "upload"
                ? "mdi-cloud-upload-outline"
                : "mdi-cloud-download-outline"
            }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              From
              {{
                key.split("@")[0] == "upload"
                  ? decodeURIComponent(key.split("@")[2])
                  : decodeURIComponent(key.split("@")[1])
              }}
            </v-list-item-title>
            <v-list-item-subtitle>
              To
              {{
                key.split("@")[0] == "upload"
                  ? decodeURIComponent(key.split("@")[1])
                  : decodeURIComponent(key.split("@")[2])
              }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <!-- <v-list-item-action class="my-0 mx-1">
            <tt-btn top icon="mdi-close" tt="Cancel" @click="cancelTask(key)" />
          </v-list-item-action> -->
        </v-list-item>
      </template>
      <template v-else>
        <v-alert color="blue-grey" type="info" dense> No task. </v-alert>
      </template>
    </v-list>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  methods: {
    cancelTask(key) {
      // ipcRenderer.send('cancel-task')
    },
  },
};
</script>
