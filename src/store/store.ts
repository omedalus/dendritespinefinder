import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const s3 = new AWS.S3();
const s3params = {
  Bucket: 'dendritespinefinder'
};


export const store = new Vuex.Store({
  state: {
    filesByFolder: {} as {[key: string]: string[]},
    currentFile: null
  },

  getters: {
    folders(state) {
      return [...Object.keys(state.filesByFolder)];
    },

    files(state) {
      return (foldername: string) => {
        if (foldername in state.filesByFolder) {
          return state.filesByFolder[foldername];
        } else {
          return [];
        }
      };
    }
  },

  mutations: {
    addFile(state, fileinfo) {
      const filename = fileinfo.filename.trim() as string;
      const foldername = fileinfo.foldername.trim() as string;

      // We need to do some stupid stuff to make Vue aware that data inside an object has changed.
      const amendedFileArray = (foldername in state.filesByFolder) ? [...state.filesByFolder[foldername]] : [];
      if (filename) {
        amendedFileArray.push(filename);
      }
      Vue.set(state.filesByFolder, foldername, amendedFileArray);
    }
  },

  actions: {
    loadFileTree({commit}) {
      s3.listObjects(s3params, (err: any, data: any) => {
        if (err) {
          throw err;
        }

        data.Contents.forEach((item: any) => {
          const filenameparts = item.Key.split('/');
          const filename = filenameparts.pop();
          const foldername = filenameparts.join('/');

          commit('addFile', {filename, foldername});
        });
      });
    }
  }
});

