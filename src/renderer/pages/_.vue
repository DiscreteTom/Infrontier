<template>
  <div>
    <bc-nav />
    <folder-view v-if="$route.path.endsWith('/')" />
    <item-view v-else />
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
