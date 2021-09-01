export const camelToUnderscore = (keyString: string) => {
  return keyString.replace( /([A-Z])/g, "-$1").toLowerCase();
}
