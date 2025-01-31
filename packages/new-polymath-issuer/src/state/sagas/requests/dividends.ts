import { polyClient } from '~/lib/polyClient';
import { cacheData } from '~/state/actions/dataRequests';
import { createAction as createDividend } from '~/state/actions/dividends';
import { call, put } from 'redux-saga/effects';
import { Dividend } from '@polymathnetwork/sdk';
import {
  RequestKeys,
  GetDividendsByCheckpointArgs,
  GetDividendBySymbolAndIdArgs,
} from '~/types';

export function* fetchDividendsByCheckpoint(
  args: GetDividendsByCheckpointArgs
) {
  const { securityTokenSymbol, checkpointIndex } = args;
  const dividends: Dividend[] = yield call(polyClient.getDividends, {
    symbol: securityTokenSymbol,
    checkpointIndex,
  });

  const fetchedIds: string[] = [];

  const dividendPojos = dividends.map(dividend => dividend.toPojo());
  for (const dividend of dividendPojos) {
    const { uid, index, dividendType } = dividend;
    fetchedIds.push(uid);

    yield put(createDividend(dividend));

    yield put(
      cacheData({
        requestKey: RequestKeys.GetDividendBySymbolAndId,
        args: {
          securityTokenSymbol,
          dividendIndex: index,
          dividendType,
        },
        fetchedIds: [uid],
      })
    );
  }

  yield put(
    cacheData({
      requestKey: RequestKeys.GetDividendsByCheckpoint,
      args,
      fetchedIds,
    })
  );
}

export function* fetchDividendBySymbolAndId(
  args: GetDividendBySymbolAndIdArgs
) {
  const { securityTokenSymbol, dividendIndex, dividendType } = args;
  const dividend: Dividend = yield call(polyClient.getDividend, {
    symbol: securityTokenSymbol,
    dividendType,
    dividendIndex,
  });

  const dividendPojo = dividend.toPojo();

  yield put(createDividend(dividendPojo));

  yield put(
    cacheData({
      requestKey: RequestKeys.GetDividendBySymbolAndId,
      args,
      fetchedIds: [dividendPojo.uid],
    })
  );
}
