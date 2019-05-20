<template>
  <v-flex full-height style="height:100%">
    <v-layout column v-if="isDataLoading">
      <h2>{{statusMsg}}</h2>
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </v-layout>

    <v-layout column full-height 
        class="processing-console"
        :style="'display:' + (isDataLoading ? 'none' : 'unset')">
      <v-toolbar flat>
        <v-btn>
          Analyze
        </v-btn>
      </v-toolbar>


      <v-flex full-height ref="imageHolder" class="image-holder">
      </v-flex>
    </v-layout>

  </v-flex>
</template>

<style scoped>
.processing-console {
  height: 100%;
}
.image-holder {
  position: relative;
  width: 100%;
  height: 100%; 
}
.image-holder img {
  position: absolute;
  top: 0;
  left: 0;
  -o-object-fit: contain;
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
}
</style>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class ImageProcessor extends Vue {
  get statusMsg() : string {
    return this.$store.state.statusMsg;
  }

  get isDataLoading() : boolean {
    return this.$store.state.loadingState === 'LOADING';
  }

  get image() : object|null {
    return this.$store.state.image.displayable;
  }

  @Watch('image')
  onDisplayableImageChanged() {
    const elemImageHolder = this.$refs.imageHolder as Element;
    elemImageHolder.innerHTML = '';
    elemImageHolder.appendChild(this.image as Element);
  }
}
</script>

