<template>
  <div>Im bringing sexy back</div>
</template>

<style>

</style>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ImageProcessor extends Vue {
  @Prop() private msg!: string;
}
</script>

