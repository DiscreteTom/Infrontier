<template>
  <div>
    <div v-if="$store.state.bucketName">
      <h1>👈 Select a folder to start</h1>
      <p class="mx-3 my-3">Current bucket: {{ $store.state.bucketName }}</p>
    </div>
    <div v-else>
      <h2>
        You need to click 'Settings' to configure this application first ↗
      </h2>
    </div>
  </div>
</template>

<script>
export default {};
</script>
