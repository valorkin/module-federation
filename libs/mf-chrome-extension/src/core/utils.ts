/**
 *
 */
export function groupBy(array: any[], key: string) {
  return array.reduce((result, current) => {
    if (!result[current[key]]) {
      result[current[key]] = [];
    }

    result[current[key]].push(current);
    return result;

  }, {});
};
