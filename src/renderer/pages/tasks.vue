<template>
  <div style="height: 100%; overflow: auto">
    <h2 class="mx-3 mb-3">Tasks</h2>
    <v-divider />
    <v-list nav dense>
      <template v-if="Object.keys($store.state.tasks).length">
        <v-list-item link v-for="(value, key) in $store.state.tasks" :key="key">
          <v-list-item-icon style="align-self: center">
            <v-icon
              :color="
                value.running
                  ? key.split('@')[0] == 'upload'
                    ? 'orange darken-4'
                    : 'blue darken-4'
                  : 'dark'
              "
            >
              {{
                key.split("@")[0] == "upload"
                  ? "mdi-arrow-up-thin-circle-outline"
                  : "mdi-arrow-down-thin-circle-outline"
              }}
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              <span style="font-weight: bold"> From: </span>
              {{
                key.split("@")[0] == "upload"
                  ? decodeURIComponent(key.split("@")[2])
                  : decodeURIComponent(key.split("@")[1])
              }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span style="font-weight: bold"> To: </span>
              {{
                key.split("@")[0] == "upload"
                  ? decodeURIComponent(key.split("@")[1])
                  : decodeURIComponent(key.split("@")[2])
              }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action class="my-0 mx-1">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-progress-circular
                    :indeterminate="value.start == undefined && value.running"
                    :value="
                      value.start == undefined
                        ? undefined
                        : (value.start / value.size) * 100
                    "
                    :size="20"
                    :rotate="-90"
                  />
                </v-btn>
              </template>
              <span>
                {{
                  value.start == undefined
                    ? "Only multipart tasks can calculate progress"
                    : ((value.start / value.size) * 100).toFixed(2) + "%"
                }}
              </span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action class="my-0 mx-1">
            <tt-btn
              top
              icon="mdi-restart"
              :disabled="value.running"
              :tt="value.running ? 'Task is already running' : 'Continue'"
              @click="resumeTask(key)"
            />
          </v-list-item-action>
          <v-list-item-action class="my-0 mx-1">
            <tt-btn
              top
              icon="mdi-close"
              :disabled="value.running"
              :tt="value.running ? 'Running task can\'t be canceled' : 'Cancel'"
              @click="cancelTask(key)"
            />
          </v-list-item-action>
        </v-list-item>
      </template>
      <template v-else>
        <v-alert color="blue-grey" type="info" dense> No task. </v-alert>
      </template>
    </v-list>
  </div>
</template>

<script>
import TtBtn from "../components/TtBtn.vue";

export default {
  components: { TtBtn },
  methods: {
    cancelTask(id) {
      this.$ipc.send("cancel-task", {
        id,
        task: this.$store.state.tasks[id],
        bucket: this.$store.state.bucketName,
      });
    },
    resumeTask(id) {
      let command = id.split("@")[0];
      let param = {
        key: decodeURIComponent(id.split("@")[1]),
        localPath: decodeURIComponent(id.split("@")[2]),
        bucket: this.$store.state.bucketName,
        chunkSize: this.$store.state.multipartDownloadChunkSize,
        multipartThreshold: this.$store.state.multipartDownloadThreshold,
        start: this.$store.state.tasks[id].start,
        size: this.$store.state.tasks[id].size,
        uploadId: this.$store.state.tasks[id].uploadId,
        partNumber: this.$store.state.tasks[id].partNumber,
        parts: this.$store.state.tasks[id].parts,
      };
      if (command == "download") {
        this.$ipc.send("save-object", param);
      } else if (command == "upload") {
        this.$ipc.send("upload-object", param);
      }
    },
  },
};
</script>
