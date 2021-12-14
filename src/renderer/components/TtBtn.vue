<template>
  <v-tooltip :top="top" :bottom="bottom" :left="left" :right="right">
    <template v-slot:activator="{ on }">
      <v-btn
        :icon="icon.length != 0"
        v-on="on"
        @click.stop.prevent="$emit('click')"
        :to="to"
      >
        <v-icon>{{ icon }}</v-icon>
        {{ btnText }}
      </v-btn>
    </template>
    <span>{{ tt }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    icon: String,
    tt: String,
    btnText: String,
    top: Boolean,
    bottom: Boolean,
    left: Boolean,
    right: Boolean,
    to: String,
  },
};
</script>
