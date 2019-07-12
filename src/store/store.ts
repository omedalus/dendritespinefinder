import Vue from 'vue';
import Vuex from 'vuex';

import * as AWS from 'aws-sdk';
// import downscale from 'downscale';

Vue.use(Vuex);

const s3 = new AWS.S3();
const s3params = {
  Bucket: 'dendritespinefinder'
};


// Inline worker implementation taken from:
// https://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
// Build a worker from an anonymous function body.
const parseImageDataWorkerFn = () => {
  self.onmessage = (e) => {
    const data = e.data;

    const mime = data.ContentType as string;
    const imgdataArray = data.Body as Uint8Array;
    const imgdataBinaryStr = imgdataArray.reduce(
      (retval: string, ch: number): string => retval + String.fromCharCode(ch), '');
    const imgdataB64 = btoa(imgdataBinaryStr);

    const imgsrc = `data:${mime};base64, ${imgdataB64}`;
    // NOTE: Typescript is really confused here because self is the worker and not the window.
    // We basically have to trick it.
    // self.postMessage(imgsrc);
  };
};
const parseImageDataWorkerBlobURL = URL.createObjectURL(new Blob(
  [`(${parseImageDataWorkerFn.toString()})()`],
  {type: 'application/javascript'}
));
const parseImageDataWorker = new Worker(parseImageDataWorkerBlobURL);

// Won't be needing this anymore
URL.revokeObjectURL(parseImageDataWorkerBlobURL);

parseImageDataWorker.addEventListener('message', (e) => {
  const img = new Image();
  img.onload = () => {
    store.commit('setStatusMsg', 'Resizing image for displayability.');
    store.commit('setImage', { which: 'full', image: img });

    /*
    downscale(img, 800, 0).
      then( (displayableImgURL: string) => {
        const displayableImg = document.createElement('img');
        displayableImg.src = displayableImgURL;

        store.commit('setLoadingState', 'LOADED');
        store.commit('setImage', { which: 'displayable', image: displayableImg });
      });
      */
  };
  img.src = e.data;
});



const makeDefaultState = () => ({
  statusMsg: '',
  errorMsg: '',
  loadingState: null as string | null,

  filesByFolder: {} as { [key: string]: string[] },
  currentFile: {
    foldername: null as string | null,
    filename: null as string | null,
    data: null as string | null
  },

  image: {
    full: null as object | null,
    displayable: null as object | null,
    thumbnail: null as object | null
  }
});


export const store = new Vuex.Store({
  state: makeDefaultState(),

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
      Object.assign(state, makeDefaultState());
    },

    setStatusMsg(state, msg) {
      state.statusMsg = msg;
    },
    setErrorMsg(state, msg) {
      state.errorMsg = msg;
    },
    setLoadingState(state, loadingState) {
      state.loadingState = loadingState;
    },

    setImage(state, {image, which}) {
      Vue.set(state.image, which, image);
    },
    clearImages(state) {
      Object.keys(state.image).forEach( (key: string) => {
        // state.image[key] = null;
      });
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
      $store.commit('setStatusMsg', 'Loading file tree');

      s3.listObjects(s3params, (err: any, data: any) => {
        if (err) {
          throw err;
        }

        $store.commit('setStatusMsg', 'Parsing file tree');
        data.Contents.forEach((item: any) => {
          const filenameparts = item.Key.split('/');
          const filename = filenameparts.pop();
          const foldername = filenameparts.join('/');

          $store.commit('addFile', {filename, foldername});
        });

        $store.commit('setCurrentFile');
        $store.commit('setStatusMsg', 'File tree ready');
      });
    },

    loadCurrentFile($store) {
      $store.commit('setCurrentFileData', {});
      $store.commit('setStatusMsg', 'Loading image data');
      $store.commit('setLoadingState', 'LOADING');

      if (!$store.state.currentFile.filename || !$store.state.currentFile.foldername) {
        $store.commit('setStatusMsg', 'No current image selected. Nothing to load.');
        return;
      }
      s3.getObject({
        ...s3params,
        Key: `${$store.state.currentFile.foldername}/${$store.state.currentFile.filename}`
      }, (err: any, data: any) => {
        if (err) {
          throw err;
        }
        $store.commit('setStatusMsg', 'Storing file data.');
        $store.commit('setCurrentFileData', data);

        $store.commit('setStatusMsg', 'Parsing image data.');

        parseImageDataWorker.postMessage(data);
      });
    }
  }
});
