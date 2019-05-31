self.addEventListener('message', function (e) {
  self.postMessage('wazzup');
}, false);