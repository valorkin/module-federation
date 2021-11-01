/**
 *
 */
export type MFCoreHooks = {
  hooks: {
    configurations: {
      updated: Function;
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
      updated: () => {}
    },

    containers: {
      loaded: () => {},
      aborted: () => {}
    }
  }
};
