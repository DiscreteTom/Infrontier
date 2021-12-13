<template>
  <div>
    <v-list nav dense>
      <template v-if="pathNotEmpty.length">
        <v-list-item
          v-for="path in pathNotEmpty"
          :key="path"
          :to="$route.path + path"
        >
          <v-list-item-icon>
            <v-icon>{{
              path.endsWith("/") ? "mdi-folder-outline" : "mdi-file-outline"
            }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ path }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template v-else>
        <v-alert color="blue-grey" type="info" dense>
          No objects in this folder.
        </v-alert>
      </template>
    </v-list>
  </div>
</template>

<script>
export default {
  props: {
    dirents: Object,
  },
  computed: {
    pathNotEmpty() {
      let result = [];
      for (let path in this.dirents) {
        if (path.length) result.push(path);
      }
      return result;
    },
  },
};
</script>
