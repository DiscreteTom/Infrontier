<template>
  <div>
    <v-alert type="success" v-model="alert" dismissible> Saved </v-alert>
    <v-text-field
      label="AWS Profile Name"
      v-model="profile"
      placeholder="default"
    ></v-text-field>
    <v-text-field label="Bucket Name" v-model="bucketName"></v-text-field>
    <v-text-field
      label="Region Code"
      v-model="region"
      placeholder="us-east-1"
    ></v-text-field>
    <v-btn @click="save">Save</v-btn>
    <v-btn @click="resetForm">Reset</v-btn>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      alert: false,
      profile: "default",
      bucketName: "",
      region: "us-east-1",
    };
  },
  methods: {
    resetForm() {
      this.profile = this.$store.state.profile;
      this.bucketName = this.$store.state.bucketName;
      this.region = this.$store.state.region;
    },
    save() {
      this.$store.commit("updateConfig", {
        profile: this.profile,
        bucketName: this.bucketName,
        region: this.region,
      });
      this.alert = true;
      ipcRenderer.send("get-aws-credentials", this.$store.state.profile);
    },
  },
  mounted() {
    this.resetForm();
  },
};
</script>

<style></style>
