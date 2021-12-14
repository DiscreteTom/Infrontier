<template>
  <div>
    <div class="mx-3 my-1">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="refresh">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>Refresh</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-cloud-upload-outline</v-icon>
          </v-btn>
        </template>
        <span>Upload</span>
      </v-tooltip>
    </div>

    <v-divider></v-divider>

    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      ></v-progress-circular>
    </div>
    <div v-else>
      <dirent-list
        :dirents="dirents"
        @delete-object="deleteObject"
      ></dirent-list>
    </div>
  </div>
</template>

<script>
import DirentList from "./DirentList.vue";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default {
  components: { DirentList },
  data() {
    return {
      path: "", // 'aaa/bbb/'
      loading: false,
      dirents: {},
    };
  },
  methods: {
    refresh() {
      this.loading = true;
      this.$store
        .dispatch("callAws", {
          service: "s3",
          params: new ListObjectsV2Command({
            Bucket: this.$store.state.bucketName,
            Prefix: this.path,
            Delimiter: "/",
          }),
        })
        .then((res) => {
          this.loading = false;
          let content = {};
          // sub folders
          if (res.CommonPrefixes) {
            res.CommonPrefixes.map((folder) => {
              let folderName = folder.Prefix.slice(this.path.length);
              content[folderName] = {};
            });
          }

          // files
          if (res.Contents) {
            res.Contents.map((file) => {
              let fileName = file.Key.slice(this.path.length);
              content[fileName] = file;
            });
          }

          // apply changes
          this.dirents = content;
          this.$store.commit("updateFolder", { path: this.path, content });
        });
    },
    deleteObject(key) {
      this.loading = true;
      key = this.path + key;
      this.$store
        .dispatch("callAws", {
          service: "s3",
          params: new DeleteObjectCommand({
            Bucket: this.$store.state.bucketName,
            Key: key,
          }),
        })
        .then((res) => {
          this.loading = false;
          console.log(res);
          this.refresh();
        });
    },
  },
  mounted() {
    this.path = this.$route.path.slice(1); // remove the leading '/'
    let current = this.$store.getters.folder(this.path);
    if (current && Object.keys(current).length != 0) {
      this.dirents = current;
    } else {
      this.refresh();
    }
  },
};
</script>

<style></style>
