declare global {
  interface Window { __appShellPluginsJson__: any; }
}

export const loadPluginsJson = (): Promise<void> => {
  return new Promise(async(resolve, reject) => {
    const pathToFile = './assets/config/plugins.json';
    const response = await window.fetch(pathToFile) as Response;

    const json = response.ok ? await response.json() : [];
    const windowConfig = Array.isArray(window.__appShellPluginsJson__) ? window.__appShellPluginsJson__ : [];

    window.__appShellPluginsJson__ = json.concat(windowConfig);
    return resolve();
  });
};
