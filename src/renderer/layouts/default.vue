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
        :badge="$store.state.taskNumber != 0"
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
import { ipcRenderer } from "electron";
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
    encodedPath() {
      return encodeURIComponent(this.$route.path);
    },
  },
  created() {
    ipcRenderer.on("load-config", (event, arg) => {
      this.$store.commit("loadConfig", arg);
      if (this.$store.state.bucketName) {
        ipcRenderer.send("get-aws-credentials", {
          profile: this.$store.state.profile,
          region: this.$store.state.region,
        });
      }
    });
    ipcRenderer.on("get-aws-credentials", (event, arg) => {
      this.$aws.configure({ ...arg, region: this.$store.state.region });
      this.refreshFolderList();
    });
    ipcRenderer.on("refresh-folder-list", (event, arg) => {
      this.refreshFolderList();
    });
    ipcRenderer.on("update-task", (event, arg) => {
      this.$store.commit("updateTask", arg);
    });
    ipcRenderer.on("finish-task", (event, arg) => {
      this.$store.commit("finishTask", arg);
    });
    this.$bus.$on("refresh-folder-list", this.refreshFolderList);

    ipcRenderer.send("load-config");
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
