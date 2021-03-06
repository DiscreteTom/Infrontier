<template>
  <v-app>
    <!-- left drawer -->
    <v-navigation-drawer v-model="leftDrawer" clipped app>
      <v-list dense nav>
        <v-list-item link @click="refreshFolderList">
          <v-list-item-icon>
            <v-icon>mdi-refresh</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Refresh </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <div v-if="loading" class="d-flex justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="50"
          class="my-3"
        ></v-progress-circular>
      </div>
      <v-list dense nav v-else>
        <v-list-item
          v-for="(detail, name) in $store.state.folders"
          :key="name"
          link
          :to="'/' + name"
        >
          <v-list-item-icon>
            <v-icon>mdi-cloud-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ name.slice(0, -1) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- top bar -->
    <v-app-bar clipped-left app flat dense>
      <!-- left drawer btn -->
      <v-app-bar-nav-icon @click.stop="leftDrawer = !leftDrawer" />
      <!-- site title -->
      <v-toolbar-title>Infrontier</v-toolbar-title>

      <v-spacer />

      <!-- home button -->
      <tt-btn bottom to="/" icon="mdi-home-outline" tt="Home" />

      <!-- add button -->
      <tt-btn
        bottom
        :to="`/add?path=${encodedPath()}`"
        icon="mdi-plus"
        tt="New Folder"
      />

      <!-- add button -->
      <tt-btn
        bottom
        to="/tasks"
        icon="mdi-clock-outline"
        tt="Tasks"
        :badge="Object.keys($store.state.tasks).length != 0"
      />

      <!-- settings button -->
      <tt-btn bottom to="/settings" icon="mdi-cog-outline" tt="Settings" />
    </v-app-bar>

    <!-- main content -->
    <v-main style="height: 100vh">
      <v-container style="height: 100%">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import TtBtn from "../components/TtBtn.vue";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default {
  components: { TtBtn },
  data() {
    return {
      leftDrawer: true,
      loading: false,
    };
  },
  methods: {
    /**
     * refresh top level folder
     */
    refreshFolderList() {
      this.loading = true;
      this.$aws.s3
        .send(
          new ListObjectsV2Command({
            Bucket: this.$store.state.bucketName,
            Delimiter: "/",
          })
        )
        .then((res) => {
          if (res.CommonPrefixes) {
            let folderNames = res.CommonPrefixes.map((e) => e.Prefix);
            this.$store.commit("updateFolderList", { folderNames });
          } else {
            this.$store.commit("updateFolderList", { folderNames: [] });
          }
          this.loading = false;
        });
    },
    /**
     * refresh sub folders
     */
    refreshFolder(path) {
      this.$aws.s3
        .send(
          new ListObjectsV2Command({
            Bucket: this.$store.state.bucketName,
            Prefix: path,
            Delimiter: "/",
          })
        )
        .then((res) => {
          let content = {};
          // sub folders
          if (res.CommonPrefixes) {
            res.CommonPrefixes.map((folder) => {
              let folderName = folder.Prefix.slice(path.length);
              content[folderName] = {};
            });
          }

          // files
          if (res.Contents) {
            res.Contents.map((file) => {
              let fileName = file.Key.slice(path.length);
              content[fileName] = file;
            });
          }

          // apply changes
          this.$store.commit("updateFolder", { path, content });
          this.$bus.$emit("refresh-folder-view");
        });
    },
    encodedPath() {
      return encodeURIComponent(this.$route.path);
    },
  },
  created() {
    this.$ipc.one("load-config", (event, arg) => {
      this.$store.commit("loadConfig", arg);
      if (this.$store.state.bucketName) {
        this.$ipc.send("get-aws-credentials", {
          profile: this.$store.state.profile,
          region: this.$store.state.region,
        });
      }
    });
    this.$ipc.one("get-aws-credentials", (event, arg) => {
      this.$aws.configure({ ...arg, region: this.$store.state.region });
      this.refreshFolderList();
    });
    this.$ipc.one("refresh-folder-list", (event, arg) => {
      this.refreshFolderList();
    });
    this.$ipc.one("update-task", (event, arg) => {
      this.$store.commit("updateTask", arg);
    });
    this.$ipc.one("finish-task", (event, arg) => {
      this.$store.commit("finishTask", arg);
    });
    this.$ipc.one("refresh-folder", (event, arg) => {
      this.refreshFolder(arg);
    });
    this.$bus.$on("refresh-folder-list", this.refreshFolderList);
    this.$bus.$on("refresh-folder", this.refreshFolder);

    this.$ipc.send("load-config", this.$store.getters.defaultState);
  },
};
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
