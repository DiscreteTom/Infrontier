<template>
  <div>
    <img
      v-if="['jpg', 'jpeg', 'png'].indexOf(fileType) != -1"
      :src="imgSrc()"
    />
    <pre v-else>{{ content.toString("utf-8") }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    content: Buffer,
  },
  methods: {
    imgSrc() {
      let type = "";
      if (["jpg", "jpeg"].indexOf(this.fileType) != -1) type = "jpeg";
      else if (this.fileType == "png") type = "png";
      return `data:image/${type};base64,` + this.content.toString("base64");
    },
  },
  computed: {
    fileType() {
      return this.$route.path.split("/").at(-1).split(".").at(-1);
    },
  },
};
</script>
