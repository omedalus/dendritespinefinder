<template>
  <v-layout column>
    {{folders}}

    {{currentFolder}}

    {{files}}
  </v-layout>
</template>

<style>

</style>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AWS from 'aws-sdk';

@Component
export default class FileSelector extends Vue {
  @Prop() private msg!: string;

  private currentFolder = null as string|null;

  get folders() {
    return this.$store.getters.folders;
  }

  get files() {
    if (!this.currentFolder) {
      return [];
    }
    return this.$store.getters.files(this.currentFolder);
  }

  created() {
    if (this.$store.getters.folders.length > 0) {
      this.currentFolder = this.$store.getters.folders[0];
    }
  }
}
</script>

