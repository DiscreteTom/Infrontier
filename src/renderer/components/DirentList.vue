<template>
  <div>
    <v-list nav dense>
      <v-list-item
        v-for="(obj, path) in dirents"
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
    </v-list>
  </div>
</template>

<script>
export default {
  props: {
    dirents: Object,
  },
};
</script>
