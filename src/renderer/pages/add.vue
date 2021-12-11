<template>
  <div>
    <v-switch v-model="useProfile" label="Use Profile"></v-switch>
    <div v-if="useProfile">
      <v-text-field label="Profile Name" v-model="profileName"></v-text-field>
    </div>
    <div v-else>
      <v-text-field label="Access Key ID" v-model="ak"></v-text-field>
      <v-text-field
        label="Secret Access Key"
        type="password"
        v-model="sk"
      ></v-text-field>
    </div>
    <v-text-field label="Bucket Name" v-model="bucketName"></v-text-field>
    <v-btn>Add</v-btn>
    <v-btn @click="resetForm">Reset</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      useProfile: true,
      profileName: "default",
      ak: "",
      sk: "",
      bucketName: "",
    };
  },
  methods: {
    resetForm() {
      this.ak = "";
      this.sk = "";
      this.bucketName = "";
      this.profileName = "default";
    },
  },
};
</script>
