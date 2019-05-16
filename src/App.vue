<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Dendrite</span>
        <span class="font-weight-light">SPINE FINDER</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="mr-2">{{todaynow}}</span>
    </v-toolbar>

    <v-content>
      <v-container fuild class="app-container" grid-list-lg fill-height>
        <v-layout row wrap fill-height>

          <v-flex xs2>
            <FileSelector/>
          </v-flex>

          <v-flex xs10>
            <ImageProcessor/>
          </v-flex>

        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<style>
#app {
  min-height: 100vh;
}

</style>

<script>
import ImageProcessor from './components/ImageProcessor';
import FileSelector from './components/FileSelector';

export default {
  name: 'App',
  components: {
    FileSelector,
    ImageProcessor
  },
  data() {
    return {
      lastHeartbeat: new Date()
    };
  },
  computed: {
    todaynow() {
      return this.lastHeartbeat.toDateString() + ' ' + this.lastHeartbeat.toLocaleTimeString();
    }
  },

  created() {
    const fnHeartbeat = () => {
      this.lastHeartbeat = new Date();
      setTimeout(fnHeartbeat, 1000);
    };
    fnHeartbeat();

    this.$store.dispatch('loadFileTree');
  }
};
</script>
