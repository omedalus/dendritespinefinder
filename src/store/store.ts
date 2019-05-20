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
    currentFile: {
      foldername: null as string|null,
      filename: null as string|null,
      data: null as string|null
    }
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
    clear(state) {
      state.filesByFolder = {};
      state.currentFile = {
        foldername: null as string | null,
        filename: null as string | null,
        data: null as string | null
      }
    },

    addFile(state, fileinfo) {
      const filename = fileinfo.filename.trim() as string;
      const foldername = fileinfo.foldername.trim() as string;

      // We need to do some stupid stuff to make Vue aware that data inside an object has changed.
      const amendedFileArray = (foldername in state.filesByFolder) ? [...state.filesByFolder[foldername]] : [];
      if (filename) {
        amendedFileArray.push(filename);
      }
      Vue.set(state.filesByFolder, foldername, amendedFileArray);
    },

    setCurrentFile(state, fileinfo) {
      if (!fileinfo) {
        fileinfo = {
          foldername: null,
          filename: null
        };
      }

      let foldername = fileinfo.foldername || null as string | null;
      let filename = fileinfo.filename || null as string | null;

      if (!foldername && filename) {
        // It's a file in the already selected current folder.
        foldername = state.currentFile.foldername;
      }
      if (!(foldername in state.filesByFolder)) {
        foldername = null;
      }
      if (!foldername) {
        filename = null;
        const folders = Object.keys(state.filesByFolder);
        if (folders.length) {
          foldername = folders[0];
        }
      }

      // At this point, we surely have a folder name, if there are any folders at all.
      if (!foldername) {
        filename = null;
      } else {
        if (!filename) {
          filename = state.currentFile.filename;
        }
        if (!state.filesByFolder[foldername].includes(filename)) {
          filename = null;
        }
        if (!filename) {
          const files = state.filesByFolder[foldername];
          if (files.length) {
            filename = files[0];
          }
        }
      }

      state.currentFile = {
        foldername,
        filename,
        data: null
      };
    },

    setCurrentFileData(state, data) {
      Vue.set(state.currentFile, 'data', data);
    }
  },

  actions: {
    loadFileTree($store) {
      $store.commit('clear');

      s3.listObjects(s3params, (err: any, data: any) => {
        if (err) {
          throw err;
        }

        data.Contents.forEach((item: any) => {
          const filenameparts = item.Key.split('/');
          const filename = filenameparts.pop();
          const foldername = filenameparts.join('/');

          $store.commit('addFile', {filename, foldername});
        });

        $store.commit('setCurrentFile');
      });
    },

    loadCurrentFile({state, getters, commit}) {
      commit('setCurrentFileData', {});
      if (!state.currentFile.filename || !state.currentFile.foldername) {
        return;
      }
      s3.getObject({
        ...s3params,
        Key: `${state.currentFile.foldername}/${state.currentFile.filename}`
      }, (err: any, data: any) => {
        if (err) {
          throw err;
        }
        commit('setCurrentFileData', data);
      });
    }
  }
});

