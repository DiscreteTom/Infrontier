<template>
  <div>
    <folder-view v-if="$route.path.endsWith('/')" />
    <item-view v-else />
  </div>
</template>

<script>
import FolderView from "../components/FolderView.vue";
import ItemView from "../components/ItemView.vue";
export default {
  components: { FolderView, ItemView },
};
</script>
