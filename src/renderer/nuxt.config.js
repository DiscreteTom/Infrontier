/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */

module.exports = {
  ssr: false,
  target: "static",
  head: {
    title: "Infrontier",
    meta: [{ charset: "utf-8" }],
  },
  css: [
    "@mdi/font/css/materialdesignicons.css",
    "@/assets/prettier-scroll-bar.less",
  ],

  loading: false,
  plugins: [{ ssr: true, src: "@/plugins/icons.js" }],
  buildModules: [],
  modules: ["@nuxtjs/vuetify"],
  vuetify: {
    defaultAssets: false,
    theme: {
      themes: {
        light: {
          primary: "#1867c0",
          secondary: "#b0bec5",
          accent: "#8c9eff",
          error: "#b71c1c",
        },
      },
    },
  },
};
