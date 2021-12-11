<template>
  <div>
    <v-breadcrumbs :items="navItems"></v-breadcrumbs>
  </div>
</template>

<script>
export default {
  computed: {
    navItems() {
      let result = [
        {
          disabled: false,
          link: true,
          text: this.$store.state.bucketName,
          exact: true,
          to: "/",
        },
      ];
      let to = "/";
      this.$route.path
        .slice(1) // remove the first '/'
        .split("/")
        .slice(0, -1)
        .map((path) => {
          to += path + "/";
          result.push({
            disabled: false,
            link: true,
            exact: true,
            text: path,
            to,
          });
        });
      return result;
    },
  },
};
</script>
