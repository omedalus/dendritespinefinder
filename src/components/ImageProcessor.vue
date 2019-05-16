<template>
  <v-flex full-height style="height:100%">
    <v-layout v-if="isDataLoading">
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </v-layout>

    <v-layout column v-else full-height class="processing-console">
      <v-toolbar flat>
        <v-btn>
          Analyze
        </v-btn>
      </v-toolbar>


      <v-flex full-height class="image-holder">
        <img :src="imgsrc" />
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
  get imgsrc() : string {
    if (this.isDataLoading || !this.$store.state.currentFile.data) {
      return '';
    }

    const mime = this.$store.state.currentFile.data.ContentType as string;
    const imgdataArray = this.$store.state.currentFile.data.Body as Uint8Array;
    const imgdataBinaryStr = imgdataArray.reduce( (retval: string, ch: number): string => retval + String.fromCharCode(ch), '');
    const imgdataB64 = btoa(imgdataBinaryStr);
    const retval = `data:${mime};base64, ${imgdataB64}`;
    return retval;
  }

  get isDataLoading() : boolean {
    const data = this.$store.state.currentFile.data;
    return (
      data &&
      (typeof data === 'object') &&
      (Object.keys(data).length === 0)
    );
  }
}
</script>

