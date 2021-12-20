<template>
  <v-tooltip :top="top" :bottom="bottom" :left="left" :right="right">
    <template v-slot:activator="{ on }">
      <div v-on="on">
        <v-btn
          :icon="icon.length != 0"
          @click.stop.prevent="$emit('click')"
          :to="to"
          :disabled="disabled"
        >
          <v-badge dot :value="badge">
            <v-icon>{{ icon }}</v-icon>
          </v-badge>
          {{ btnText }}
        </v-btn>
      </div>
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
    badge: Boolean,
    disabled: Boolean,
  },
};
</script>
