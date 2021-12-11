<template>
  <div>
    <bc-nav />
    <div>{{ content }}</div>
  </div>
</template>

<script>
import BcNav from "./BcNav.vue";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export default {
  components: { BcNav },
  data() {
    return {
      path: "", // 'aaa/bbb/ccc'
      content: "",
    };
  },
  methods: {
    refresh() {
      this.$store
        .dispatch("callAws", {
          service: "s3",
          params: new GetObjectCommand({
            Bucket: this.$store.state.bucketName,
            Key: this.path,
          }),
        })
        .then((res) => {
          this.content = streamToString(res.Body).then(
            (data) => (this.content = data)
          );
        });
    },
  },
  mounted() {
    this.path = this.$route.path.slice(1); // remove the leading '/'
    this.refresh();
  },
};
</script>

<style></style>
