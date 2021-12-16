<template>
  <div>
    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
        class="my-3"
      ></v-progress-circular>
    </div>
    <div v-else>
      <img
        v-if="['jpg', 'jpeg', 'png'].indexOf(fileType) != -1"
        :src="imgSrc"
      />
      <v-simple-table v-else-if="fileType == 'csv'">
        <template v-slot:default>
          <tbody>
            <tr v-for="(line, index) in csvContent" :key="index">
              <td v-for="column in line" :key="column">{{ column }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <pre v-else>{{ content.toString("utf-8") }}</pre>
    </div>
  </div>
</template>

<script>
import * as csv from "csv";

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

export default {
  props: {
    content: Buffer,
  },
  data() {
    return {
      loading: false,
      fileType: "",
      imgSrc: "",
      csvContent: null,
    };
  },
  methods: {
    parseImg() {
      let type = "";
      if (["jpg", "jpeg"].indexOf(this.fileType) != -1) type = "jpeg";
      else if (this.fileType == "png") type = "png";
      else {
        this.imgSrc = "";
        return;
      }
      this.imgSrc =
        `data:image/${type};base64,` + this.content.toString("base64");
    },
    parseCsv() {
      if (this.fileType == "csv") {
        this.loading = true;
        csv.parse(
          this.content,
          {
            delimiter: ",",
          },
          (err, data) => {
            this.csvContent = data;
            this.loading = false;
          }
        );
      } else {
        this.csvContent = null;
      }
    },
  },
  mounted() {
    this.fileType = this.$route.path.split("/").at(-1).split(".").at(-1);
    this.parseImg();
    this.parseCsv();
  },
};
</script>
