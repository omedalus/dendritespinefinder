<template>
  <v-layout column>

  </v-layout>
</template>

<style>

</style>


<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class FileSelector extends Vue {
  @Prop() private msg!: string;
}
</script>

