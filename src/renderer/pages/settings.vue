<template>
  <div>
    <v-alert type="success" v-model="alert" dismissible> Saved </v-alert>
    <v-text-field label="AWS Profile Name" v-model="profileName"></v-text-field>
    <v-text-field label="Bucket Name" v-model="bucketName"></v-text-field>
    <v-btn @click="save">Save</v-btn>
    <v-btn @click="resetForm">Reset</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      alert: false,
      profileName: "default",
      bucketName: "",
    };
  },
  methods: {
    resetForm() {
      this.profileName = this.$store.state.profileName;
      this.bucketName = this.$store.state.bucketName;
    },
    save() {
      this.$store.commit("updateConfig", {
        profileName: this.profileName,
        bucketName: this.bucketName,
      });
      this.alert = true;
    },
  },
  mounted() {
    this.resetForm();
  },
};
</script>

<style></style>
