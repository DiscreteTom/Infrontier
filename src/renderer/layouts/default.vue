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

      <v-list dense nav>
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

      <!-- add button -->
      <tt-btn
        bottom
        :to="`/add?path=${encodedPath()}`"
        icon="mdi-plus"
        tt="New Folder"
      />

      <!-- settings button -->
      <tt-btn bottom to="/settings" icon="mdi-cog-outline" tt="Settings" />
    </v-app-bar>

    <!-- main content -->
    <v-main>
      <v-container>
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
    };
  },
  methods: {
    refreshFolderList() {
      this.$store
        .dispatch("callAws", {
          service: "s3",
          params: new ListObjectsV2Command({
            Bucket: this.$store.state.bucketName,
            Delimiter: "/",
          }),
        })
        .then((res) => {
          console.log(res);
          if (res.CommonPrefixes) {
            let folderNames = res.CommonPrefixes.map((e) => e.Prefix);
            this.$store.commit("updateFolderList", { folderNames });
          }
        });
    },
    encodedPath() {
      return encodeURIComponent(this.$route.path);
    },
  },
  created() {
    ipcRenderer.on("load-config", (event, arg) => {
      this.$store.commit("loadConfig", arg);
    });
    ipcRenderer.on("get-aws-credentials", (event, arg) => {
      this.$store.commit("initAws", arg);
    });

    ipcRenderer.send("load-config");
    ipcRenderer.send("get-aws-credentials");
  },
};
</script>

<style>
body {
  margin: 0 !important;
}
</style>
