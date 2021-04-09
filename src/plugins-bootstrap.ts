declare global {
  interface Window { __appShellPluginsJson__: any; }
}

export const loadPluginsJson = (): Promise<void> => {
  return new Promise(async(resolve, reject) => {
    const pathToFile = './assets/config/plugins.json';
    const response = await window.fetch(pathToFile) as Response;

    if (!response.ok) {
      reject();
    }

    const json = await response.json();

    if (Array.isArray(json)) {
      window.__appShellPluginsJson__ = json;
      return resolve();
    }

    reject();
  });
}
