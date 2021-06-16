/**
 *
 */
export const loadRemoteEntryJs = (uri: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = uri;

    script.onerror = () => {
      reject(
        new Error(
          `RemoteEntryJsLoadingError: Can't fetch a remote entry from ${uri}`
        )
      );
    };

    script.onload = () => {
      resolve();
    };

    document.body.append(script);
  });
}