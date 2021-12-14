<template>
  <div style="height: 100%" class="d-flex flex-column">
    <bc-nav />
    <folder-view
      v-if="$route.path.endsWith('/')"
      class="flex-grow-1"
      style="overflow: hidden"
    />
    <item-view v-else class="flex-grow-1" style="overflow: hidden" />
  </div>
</template>

<script>
import FolderView from "../components/FolderView.vue";
import ItemView from "../components/ItemView.vue";
import BcNav from "../components/BcNav.vue";

export default {
  components: { FolderView, ItemView, BcNav },
};
</script>
