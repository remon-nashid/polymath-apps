import { polyClient } from '~/lib/polyClient';
import { cacheData } from '~/state/actions/dataRequests';
import { createAction as createCheckpoint } from '~/state/actions/checkpoints';
import { createAction as createDividend } from '~/state/actions/dividends';
import { call, put } from 'redux-saga/effects';
import { Checkpoint } from '@polymathnetwork/sdk';
import {
  RequestKeys,
  GetCheckpointBySymbolAndIdArgs,
  GetCheckpointsBySymbolArgs,
} from '~/types';
import { types } from '@polymathnetwork/new-shared';

/**
 * Creates an entity in the state representing the checkpoint and the corresponding cache
 * entries for all associated requests
 *
 * @param checkpoint POJO representing a checkpoint
 */
export function* saveCheckpoint(checkpoint: types.CheckpointPojo) {
  const { dividends, ...rest } = checkpoint;
  const { securityTokenSymbol, uid, index: checkpointIndex } = checkpoint;

  const fetchedDividendIds: string[] = [];

  for (const dividend of dividends) {
    fetchedDividendIds.push(dividend.uid);

    yield put(createDividend(dividend));
  }

  // cross-cache the dividends
  yield put(
    cacheData({
      requestKey: RequestKeys.GetDividendsByCheckpoint,
      args: { securityTokenSymbol, checkpointIndex },
      fetchedIds: fetchedDividendIds,
    })
  );

  yield put(createCheckpoint(rest));

  yield put(
    cacheData({
      requestKey: RequestKeys.GetCheckpointBySymbolAndId,
      args: { securityTokenSymbol, checkpointIndex },
      fetchedIds: [uid],
    })
  );
}

/**
 * Fetches a particular checkpoint for a security token from the blockchain
 *
 * @param args request arguments
 */
export function* fetchCheckpointBySymbolAndId(
  args: GetCheckpointBySymbolAndIdArgs
) {
  const { securityTokenSymbol, checkpointIndex } = args;
  const checkpoint: Checkpoint | null = yield call(polyClient.getCheckpoint, {
    symbol: securityTokenSymbol,
    checkpointIndex,
  });

  if (checkpoint) {
    const checkpointPojo = checkpoint.toPojo();

    yield call(saveCheckpoint, checkpointPojo);
  }
}

/**
 * Fetches a all checkpoints for a security token
 * from the cache or the blockchain
 *
 * @param args request arguments
 */
export function* fetchCheckpointsBySymbol(args: GetCheckpointsBySymbolArgs) {
  const { securityTokenSymbol } = args;
  const checkpoints: Checkpoint[] = yield call(polyClient.getCheckpoints, {
    symbol: securityTokenSymbol,
  });

  const fetchedCheckpointIds: string[] = [];

  const checkpointPojos = checkpoints.map(checkpoint => checkpoint.toPojo());
  for (const checkpoint of checkpointPojos) {
    fetchedCheckpointIds.push(checkpoint.uid);

    yield call(saveCheckpoint, checkpoint);
  }

  yield put(
    cacheData({
      requestKey: RequestKeys.GetCheckpointsBySymbol,
      args,
      fetchedIds: fetchedCheckpointIds,
    })
  );
}
