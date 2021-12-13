<template>
  <div>
    <v-alert :type="alertType" v-model="alert" dismissible>
      {{ alertText }}
    </v-alert>
    <h2>Create a new folder:</h2>
    <v-text-field label="Folder Path" v-model="key"></v-text-field>
    <v-btn @click="submit" :disabled="!this.key.length">Submit</v-btn>
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
    };
  },
  methods: {
    submit() {
      if (!this.key.endsWith("/")) this.key += "/";

      this.$store
        .dispatch("callAws", {
          service: "s3",
          params: new PutObjectCommand({
            Bucket: this.$store.state.bucketName,
            Key: this.key,
          }),
        })
        .then((res) => {
          console.log(res);
          this.alertText = "Created";
          this.alertType = "success";
          this.alert = true;
        })
        .catch((err) => {
          console.log(err);
          this.alertText = `Error: ${err}`;
          this.alertType = "error";
          this.alert = true;
        });
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
