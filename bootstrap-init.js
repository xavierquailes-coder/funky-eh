async function berriRegisterServiceWorker(path) {
  const registration = await navigator.serviceWorker.register(path, {
    type: "classic",
    updateViaCache: "none"
  });

  await navigator.serviceWorker.ready;

  if (registration.active) return registration.active;

  if (registration.installing) {
    await new Promise((resolve) => {
      const worker = registration.installing;

      if (worker.state === "activated") {
        resolve();
        return;
      }

      const onStateChange = () => {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", onStateChange);
          resolve();
        }
      };

      worker.addEventListener("statechange", onStateChange);
    });

    return registration.active;
  }

  if (registration.waiting) {
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {
        once: true
      });
    });

    return navigator.serviceWorker.controller;
  }

  throw new Error("No active Scramjet service worker was found.");
}

function berriLoadScript(path) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-berri-src="${path}"]`);

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed to load ${path}`)),
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = path;
    script.dataset.berriSrc = path;

    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${path}`)),
      { once: true }
    );

    document.head.appendChild(script);
  });
}

async function initBootstrap() {
  const config = {
    swPath: "/sw.js",
    libcurlClientPath: "/clients/libcurl-client.js",
    scramjetControllerApiPath: "/controller/controller.api.js",
    scramjetControllerInjectPath: "/controller/controller.inject.js",
    scramjetControllerSwPath: "/controller/controller.sw.js",
    scramjetBundlePath: "/scram/scramjet.js",
    scramjetWasmPath: "/scram/scramjet.wasm",
    scramjetUtilsBundlePath: "/scram/scramjet-utils.js"
  };

  const wisp = "wss://cherrion.top/socket/";

  const serviceWorker = await berriRegisterServiceWorker(config.swPath);

  await berriLoadScript(config.scramjetBundlePath);
  await berriLoadScript(config.scramjetControllerApiPath);
  await berriLoadScript(config.scramjetUtilsBundlePath);
  await berriLoadScript(config.libcurlClientPath);

  if (!window.LibcurlTransport?.LibcurlClient) {
    throw new Error("Libcurl transport did not load.");
  }

  if (!window.$scramjetController?.Controller) {
    throw new Error("Scramjet controller did not load.");
  }

  const transport = new window.LibcurlTransport.LibcurlClient({ wisp });
  const { Controller, config: scramjetConfig } = window.$scramjetController;

  scramjetConfig.injectPath = config.scramjetControllerInjectPath;
  scramjetConfig.wasmPath = config.scramjetWasmPath;
  scramjetConfig.scramjetPath = config.scramjetBundlePath;

  console.info("Berri transport: Libcurl");
  console.info("Berri Wisp:", wisp);

  return new Controller({
    serviceworker: serviceWorker,
    transport
  });
}
