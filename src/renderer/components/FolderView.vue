<template>
  <div>
    <bc-nav />
    <v-btn @click="refresh" block>Refresh</v-btn>

    <dirent-list :dirents="dirents"></dirent-list>
  </div>
</template>

<script>
import DirentList from "./DirentList.vue";
import BcNav from "./BcNav.vue";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default {
  components: { DirentList, BcNav },
  data() {
    return {
      path: "", // 'aaa/bbb/'
      dirents: {},
    };
  },
  methods: {
    refresh() {
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
