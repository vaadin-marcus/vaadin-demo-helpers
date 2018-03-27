var emitted = [];

window.addDemoReadyListener = function (demoId, callback) {
  let listenerFunction = function (evt) {
    let demo = evt.detail.host.root.querySelector(demoId).root;
    if (demo) {
      window.removeEventListener('VaadinDemoReady', listenerFunction);
      emitted.push(demoId);
      callback(demo);
    }
  };

  window.addEventListener('VaadinDemoReady', listenerFunction);
};

window.DemoReadyEventEmitter = superClass => {
  return class extends superClass {
    ready() {
      super.ready();
      // We need to delay since `ready` is executed before `_showDemo` and script tags
      // might not be loaded yet (non Chrome browsers);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('VaadinDemoReady', {
          bubbles: true,
          detail: { host: this }
        }));
      }, 50);
    }
  }
};

