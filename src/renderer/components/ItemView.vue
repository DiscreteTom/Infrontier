<template>
  <div class="d-flex flex-column" style="overflow: hidden">
    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
        class="my-3"
      ></v-progress-circular>
    </div>
    <div v-else style="overflow: auto; width: 100%">
      <file-content v-if="content && content.length" :content="content" />
      <v-alert color="blue-grey" type="info" dense v-else>
        No content in this object.
      </v-alert>
    </div>
  </div>
</template>

<script>
import { GetObjectCommand } from "@aws-sdk/client-s3";
import FileContent from "./FileContent.vue";

const streamToBytes = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

export default {
  components: { FileContent },
  data() {
    return {
      path: "", // 'aaa/bbb/ccc'
      loading: false,
      content: null,
    };
  },
  methods: {
    refresh() {
      this.loading = true;
      this.$aws.s3
        .send(
          new GetObjectCommand({
            Bucket: this.$store.state.bucketName,
            Key: this.path,
          })
        )
        .then((res) => {
          this.content = streamToBytes(res.Body).then((data) => {
            this.content = data;
            this.loading = false;
          });
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
