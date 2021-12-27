<template>
  <div style="height: 100%; overflow: auto; padding-bottom: 10px">
    <v-alert
      type="warning"
      :value="Object.keys($store.state.tasks).length != 0"
    >
      Please wait for all tasks to be done before change settings.
    </v-alert>
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

    <!-- multipart upload -->
    <v-text-field
      label="Multipart Upload Threshold (MB)"
      v-model="multipartUploadThreshold"
      placeholder="100"
    ></v-text-field>
    <v-text-field
      label="Multipart Upload Minimal Chunk Size (MB)"
      v-model="multipartUploadChunkSize"
      placeholder="5"
    ></v-text-field>

    <!-- multipart download -->
    <v-text-field
      label="Multipart Download Threshold (MB)"
      v-model="multipartDownloadThreshold"
      placeholder="100"
    ></v-text-field>
    <v-text-field
      label="Multipart Download Chunk Size (MB)"
      v-model="multipartDownloadChunkSize"
      placeholder="5"
    ></v-text-field>

    <v-btn @click="save" color="primary">Save</v-btn>
    <v-btn @click="resetForm">Reset</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      alert: false,
      profile: "default",
      bucketName: "",
      region: "us-east-1",
      multipartUploadThreshold: 100,
      multipartUploadChunkSize: 5,
      multipartDownloadThreshold: 100,
      multipartDownloadChunkSize: 5,
    };
  },
  methods: {
    resetForm() {
      this.profile = this.$store.state.profile;
      this.bucketName = this.$store.state.bucketName;
      this.region = this.$store.state.region;
      this.multipartUploadThreshold =
        this.$store.state.multipartUploadThreshold;
      this.multipartUploadChunkSize =
        this.$store.state.multipartUploadChunkSize;
      this.multipartDownloadThreshold =
        this.$store.state.multipartDownloadThreshold;
      this.multipartDownloadChunkSize =
        this.$store.state.multipartDownloadChunkSize;
    },
    save() {
      this.$store.commit("updateConfig", {
        profile: this.profile,
        bucketName: this.bucketName,
        region: this.region,
        multipartUploadThreshold: this.multipartUploadThreshold,
        multipartUploadChunkSize: this.multipartUploadChunkSize,
        multipartDownloadThreshold: this.multipartDownloadThreshold,
        multipartDownloadChunkSize: this.multipartDownloadChunkSize,
        tasks: {},
      });
      this.alert = true;
      this.$ipc.send("get-aws-credentials", {
        profile: this.$store.state.profile,
        region: this.$store.state.region,
      });
    },
  },
  mounted() {
    this.resetForm();
  },
};
</script>

<style></style>
