<template>
  <v-layout column fill-height>
    <v-select
      v-model="currentFolder"
      :items="folders"
      label="Folder"
      prepend-icon="folder"
    ></v-select>

    <v-flex fill-height class="file-selector-scroller">
      <v-list>
        <v-list-tile v-for="file in files" :key="file" @click="currentFile = file"
            :class="currentFile == file ? 'current' : ''">
          <v-list-tile-content>
            {{file}}
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>

  </v-layout>
</template>

<style scoped>
.file-selector-scroller {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.v-list {
  position: absolute;
  width: calc(100% - .5ex);
  top: 0;
  left: 0;
}
.v-list .current {
  background-color: rgba(128,200,255, .6);
}
</style>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class FileSelector extends Vue {
  get currentFolder() {
    return this.$store.state.currentFile.foldername;
  }

  set currentFolder(foldername) {
    this.$store.commit('setCurrentFile', {foldername});
  }

  get currentFile() {
    return this.$store.state.currentFile.filename;
  }

  set currentFile(filename) {
    this.$store.commit('setCurrentFile', {filename});
  }


  get folders() {
    return this.$store.getters.folders;
  }

  get files() {
    if (!this.currentFolder) {
      return [];
    }
    return this.$store.getters.files(this.currentFolder);
  }


  @Watch('currentFile')
  private onCurrentFileUpdated() {
    this.$store.dispatch('loadCurrentFile');
  }
}
</script>

