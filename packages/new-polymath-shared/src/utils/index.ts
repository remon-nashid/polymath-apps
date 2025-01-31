import { saveAs } from 'file-saver';
import { parse, json2csv } from 'json2csv';
import { isPojo } from '~/typing/types';
import _ from 'lodash';

export const delay = async (amount: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, amount);
  });
};

/**
 * Returns a string hash of a POJO for comparison
 *
 * @param args arguments to hash
 */
export function hashObj(args: any): string {
  const sortedKeyArray = _.keys(args).sort();

  return _.join(
    _.map(sortedKeyArray, key => {
      const val = args[key];
      let result;

      if (isPojo(val)) {
        result = hashObj(val);
      } else {
        result = `${args[key]}`;
      }

      return `${key}:${result}`;
    }),
    ','
  );
}

export const toEtherscanUrl = (
  value: string,
  { subdomain, type = 'tx' }: { subdomain?: string; type?: string } = {}
) => `https://${subdomain ? subdomain + '.' : ''}etherscan.io/${type}/${value}`;

/**
 * Generates a CSV file from JSON data and triggers a download in the client
 *
 * @param data json2csv data, see https://www.npmjs.com/package/json2csv#javascript-module-examples
 * @param fileName name of the downloaded file
 * @param opts json2csv options, see https://www.npmjs.com/package/json2csv#available-options
 */
export const downloadCsvFile = <T>(
  data: Readonly<T> | ReadonlyArray<T>,
  fileName: string,
  opts?: json2csv.Options<T>
) => {
  const csvOutput = parse(data, opts);

  const blob = new Blob([csvOutput], { type: 'text/csv' });
  const formattedFilename = fileName.endsWith('.csv')
    ? fileName
    : `${fileName}.csv`;

  saveAs(blob, formattedFilename);
};
