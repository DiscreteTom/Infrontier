<template>
  <div>
    <v-alert :type="alertType" v-model="alert" dismissible>
      {{ alertText }}
    </v-alert>
    <h2>Create a new folder:</h2>
    <v-text-field label="Folder Path" v-model="key"></v-text-field>
    <v-btn @click="submit" :disabled="btnDisabled" :loading="btnLoading">
      Submit
    </v-btn>
  </div>
</template>

<script>
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default {
  data() {
    return {
      key: "",
      alert: false,
      alertText: "",
      alertType: "success",
      btnLoading: false,
    };
  },
  methods: {
    submit() {
      this.btnLoading = true;
      if (!this.key.endsWith("/")) this.key += "/";

      this.$aws.s3
        .send(
          new PutObjectCommand({
            Bucket: this.$store.state.bucketName,
            Key: this.key,
          })
        )
        .then((res) => {
          this.alertText = "Created";
          this.alertType = "success";
          this.alert = true;
          this.btnLoading = false;
        })
        .catch((err) => {
          this.alertText = `Error: ${err}`;
          this.alertType = "error";
          this.alert = true;
          this.btnLoading = false;
        });
    },
  },
  computed: {
    btnDisabled() {
      return this.key.length == 0 || this.btnLoading;
    },
  },
  mounted() {
    this.key = decodeURIComponent(this.$route.query.path);
    if (!this.key.endsWith("/")) {
      this.key = this.key.split("/").slice(0, -1).join("/");
    }
    this.key = this.key.slice(1); // remove the first '/'
  },
};
</script>
