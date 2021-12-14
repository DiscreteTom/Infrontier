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

          <v-list-item-action v-if="!path.endsWith('/')" class="my-0 mx-1">
            <tt-btn top icon="mdi-cloud-download-outline" tt="Download" />
          </v-list-item-action>
          <v-list-item-action v-if="!path.endsWith('/')" class="my-0 mx-1">
            <tt-btn
              top
              icon="mdi-delete-outline"
              tt="Delete"
              @click="$emit('delete-object', path)"
            />
          </v-list-item-action>
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
import TtBtn from "./TtBtn.vue";

export default {
  components: { TtBtn },
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
