<template>
  <div class="d-flex flex-column" style="overflow: hidden">
    <div class="mx-3 my-1">
      <tt-btn top icon="mdi-refresh" tt="Refresh" @click="refresh" />
      <tt-btn top icon="mdi-cloud-upload-outline" tt="Upload" @click="upload" />
      <tt-btn
        top
        icon="mdi-delete-outline"
        tt="Delete this folder"
        @click="deleteObjectOrFolder('')"
      />
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="fileChosen"
      />
    </div>

    <v-divider></v-divider>

    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
        class="my-3"
      ></v-progress-circular>
    </div>
    <div
      v-else
      class="flex-grow-1"
      style="overflow: auto"
      @dragenter.prevent.stop="dragEnterCount++"
      @dragleave.prevent.stop="dragEnterCount--"
      @dragover.prevent.stop
      @drop.prevent="onDrop"
    >
      <div
        v-if="dragEnterCount > 0"
        style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: #00000061;
          z-index: 1;
        "
        class="d-flex flex-column justify-center align-center"
      >
        <v-icon color="white" style="font-size: 120px">
          mdi-cloud-upload-outline
        </v-icon>
        <span style="color: white; font-size: 50px"> Drop file to upload </span>
      </div>
      <dirent-list
        :dirents="dirents"
        @delete-object-or-folder="deleteObjectOrFolder"
        @share-object="shareBtnClicked($event)"
      ></dirent-list>
    </div>

    <v-dialog
      v-model="showShareDialog"
      transition="dialog-bottom-transition"
      max-width="600px"
    >
      <v-card>
        <v-card-title> How long would you like to share? </v-card-title>
        <v-card-subtitle> Sharing: {{ objectToBeShare }} </v-card-subtitle>
        <v-card-text>
          <v-text-field
            v-model="shareExpireNumber"
            type="number"
            :rules="[
              () =>
                shareExpireNumber * shareExpireFactor <= 604800 ||
                'Maximum period is 1 week',
            ]"
          />
          <v-radio-group v-model="shareExpireFactor" row>
            <v-radio label="Hour(s)" :value="3600"></v-radio>
            <v-radio label="Day(s)" :value="3600 * 24"></v-radio>
          </v-radio-group>
          <v-alert v-if="shareErr" type="error"> {{ shareErr }} </v-alert>
          <v-btn @click="generateShareLink" color="primary">
            Generate Link
          </v-btn>
          <v-btn @click="showShareDialog = false" class="mx-3"> Cancel </v-btn>
        </v-card-text>

        <v-card-text v-if="signedUrl">
          <v-text-field v-model="signedUrl" readonly outlined />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DirentList from "./DirentList.vue";
import TtBtn from "./TtBtn.vue";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ipcRenderer } from "electron";

export default {
  components: { DirentList, TtBtn },
  data() {
    return {
      path: "", // 'aaa/bbb/'
      loading: false,
      dirents: {},
      dragEnterCount: 0,
      objectToBeShare: "",
      showShareDialog: false,
      shareExpireNumber: 1,
      shareExpireFactor: 3600,
      signedUrl: "",
      shareErr: "",
    };
  },
  methods: {
    // call aws
    refresh() {
      this.loading = true;
      this.$bus.$emit("refresh-folder", this.path);
    },
    // retrieve dirents from vuex
    refreshDirents() {
      this.dirents = this.$store.getters.folder(this.path);
      this.loading = false;
    },
    deleteObjectOrFolder(key) {
      if (!key.endsWith("/") && key.length != 0) {
        // delete one object
        this.loading = true;
        key = this.path + key;
        this.$aws.s3
          .send(
            new DeleteObjectCommand({
              Bucket: this.$store.state.bucketName,
              Key: key,
            })
          )
          .then((res) => {
            this.loading = false;
            this.refresh();
          });
      } else {
        // delete a folder, use main process
        ipcRenderer.send("delete-folder", {
          bucket: this.$store.state.bucketName,
          prefix: this.path + key,
        });
        if (key.length == 0) {
          // deleting current folder, navigate to the parent path
          if (this.path.split("/").length == 2) {
            this.$router.push("/");
          } else {
            this.$router.push(
              "/" + this.path.split("/").slice(0, -2).join("/") + "/"
            );
          }
        }
      }
    },
    onDrop(event) {
      this.dragEnterCount = 0;
      ipcRenderer.send("upload-object", {
        bucket: this.$store.state.bucketName,
        localPath: event.dataTransfer.files[0].path,
        key: this.path + event.dataTransfer.files[0].name,
        chunkSize: this.$store.state.multipartUploadChunkSize,
        multipartThreshold: this.$store.state.multipartUploadThreshold,
      });
    },
    upload() {
      this.$refs.fileInput.click();
    },
    fileChosen(event) {
      ipcRenderer.send("upload-object", {
        bucket: this.$store.state.bucketName,
        localPath: event.target.files[0].path,
        key: this.path + event.target.files[0].name,
        chunkSize: this.$store.state.multipartUploadChunkSize,
        multipartThreshold: this.$store.state.multipartUploadThreshold,
      });
    },
    shareBtnClicked(key) {
      this.objectToBeShare = this.path + key;
      this.signedUrl = "";
      this.shareErr = "";
      this.showShareDialog = true;
    },
    generateShareLink() {
      this.signedUrl = "";
      this.shareErr = "";
      getSignedUrl(
        this.$aws.s3,
        new GetObjectCommand({
          Bucket: this.$store.state.bucketName,
          Key: this.objectToBeShare,
        }),
        { expiresIn: this.shareExpireNumber * this.shareExpireFactor }
      )
        .then((url) => (this.signedUrl = url))
        .catch((err) => (this.shareErr = err));
    },
  },
  mounted() {
    this.path = this.$route.path.slice(1); // remove the leading '/'
    this.refreshDirents();
    if (!this.dirents || Object.keys(this.dirents).length == 0) {
      this.refresh();
    }
  },
  created() {
    this.$bus.$on("refresh-folder-view", this.refreshDirents);
  },
};
</script>

<style></style>
