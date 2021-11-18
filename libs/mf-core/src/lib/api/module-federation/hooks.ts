/**
 *
 */
export type MFCoreHooks = {
  hooks: {
    configurations: {
      updated: Function;
      resolved: Function;
      aborted: Function;
    },

    containers: {
      loaded: Function;
      aborted: Function;
    }
  }
}

window.mfCore = {
  hooks: {
    configurations: {
      updated: () => {},
      resolved: () => {},
      aborted: () => {}
    },

    containers: {
      loaded: () => {},
      aborted: () => {}
    }
  }
};
