import {
  getApp,
  getEntities,
  getDataRequests,
  getSession,
  getActiveTransactionQueueId,
  getTransactionQueues,
  getTransactions,
  createGetActiveTransactionQueue,
  createGetEntitiesFromCache,
  createGetCacheStatus,
  checkFetchersForDuplicates,
  createGetLoadingStatus,
} from '../selectors';
import { RootState } from '~/state/store';
import BigNumber from 'bignumber.js';
import { RequestKeys, Entities, Fetcher } from '~/types';
import { types, utils } from '@polymathnetwork/new-shared';
import { AppState } from '~/state/reducers/app';
import { SessionState } from '~/state/reducers/session';
import { EntitiesState } from '~/state/reducers/entities';

const firstRequestArgs = { securityTokenSymbol: 'FOO' };
const secondRequestArgs = { securityTokenSymbol: 'BAR' };
const thirdRequestArgs = { securityTokenSymbol: 'BAZ' };
const firstInvalidArgs = { securityTokenSymbol: 'NOT_CACHED' };
const secondInvalidArgs = { securityTokenSymbol: 'NOT_CACHED_EITHER' };

const appState: AppState = {
  polyClientInitialized: true,
  changingRoute: false,
  activeTransactionQueue: 'tq0',
};

const sessionState: SessionState = {};

const routerState = {};

const checkpoints = {
  byId: {
    c0: {
      uid: 'c0',
      index: 0,
      securityTokenId: 's0',
      securityTokenSymbol: 'S',
      investorBalances: [],
      totalSupply: new BigNumber('1000000'),
      createdAt: new Date(),
    },
    c1: {
      uid: 'c1',
      index: 2,
      securityTokenId: 's0',
      securityTokenSymbol: 'S',
      investorBalances: [],
      totalSupply: new BigNumber('2000000'),
      createdAt: new Date(),
    },
  },
  allIds: ['c0', 'c1'],
};

const dividends = {
  byId: {
    d0: {
      uid: 'd0',
      index: 0,
      created: new Date(),
      dividendType: types.DividendModuleTypes.Erc20,
      securityTokenId: 's0',
      securityTokenSymbol: 'S',
      checkpointId: 'c0',
      maturity: new Date(),
      expiry: new Date(),
      amount: new BigNumber('10000'),
      claimedAmount: new BigNumber('500'),
      totalSupply: new BigNumber('1000000'),
      reclaimed: false,
      totalWithheld: new BigNumber('500'),
      totalWithheldWithdrawn: new BigNumber('250'),
      investors: [],
      name: 'Dividend0',
      currency: 'POLY',
    },
  },
  allIds: ['d0'],
};

const transactions = {
  byId: {
    t0: {
      uid: 't0',
      transactionQueueUid: 'tq0',
      status: types.TransactionStatus.Idle,
      tag: types.PolyTransactionTags.Approve,
      args: {},
    },
    t1: {
      uid: 't1',
      transactionQueueUid: 'tq0',
      status: types.TransactionStatus.Idle,
      tag: types.PolyTransactionTags.CreateCheckpoint,
      args: {
        a: 1,
        b: 2,
        c: 3,
      },
    },
    t2: {
      uid: 't2',
      transactionQueueUid: 'tq1',
      status: types.TransactionStatus.Idle,
      tag: types.PolyTransactionTags.Approve,
      args: {
        a: 1,
        b: 2,
        c: 3,
      },
    },
  },
  allIds: ['t0', 't1', 't2'],
};

const erc20DividendsModules = {
  byId: {},
  allIds: [],
};

const taxWithholdings = {
  byId: {},
  allIds: [],
};

const transactionQueues = {
  byId: {
    tq0: {
      uid: 'tq0',
      status: types.TransactionQueueStatus.Idle,
      procedureType: types.ProcedureTypes.UnnamedProcedure,
      args: {},
    },
    tq1: {
      uid: 'tq1',
      status: types.TransactionQueueStatus.Idle,
      procedureType: types.ProcedureTypes.UnnamedProcedure,
      args: {},
    },
  },
  allIds: ['tq0', 'tq1'],
};

const erc20TokenBalances = {
  byId: {},
  allIds: [],
};

const entitiesState: EntitiesState = {
  checkpoints,
  dividends,
  transactions,
  erc20DividendsModules,
  taxWithholdings,
  transactionQueues,
  erc20TokenBalances,
};

const dataRequestsState = {
  [RequestKeys.GetCheckpointsBySymbol]: {
    [utils.hashObj(firstRequestArgs)]: { fetching: false, fetchedIds: ['c0'] },
    [utils.hashObj(secondRequestArgs)]: { fetching: false, fetchedIds: ['c1'] },
    [utils.hashObj(thirdRequestArgs)]: {
      fetching: false,
      fetchedIds: ['c0', 'c1'],
    },
  },
  [RequestKeys.GetCheckpointBySymbolAndId]: {},
  [RequestKeys.GetSecurityTokenBySymbol]: {},
  [RequestKeys.GetDividendsByCheckpoint]: {},
  [RequestKeys.GetErc20DividendsModuleBySymbol]: {},
  [RequestKeys.GetTaxWithholdingListBySymbolAndCheckpoint]: {},
  [RequestKeys.GetDividendBySymbolAndId]: {},
  [RequestKeys.GetErc20BalanceByAddressAndWallet]: {},
};

const mockState: RootState = {
  session: sessionState,
  router: routerState,
  entities: entitiesState,
  dataRequests: dataRequestsState,
  app: appState,
};

describe('Selectors', () => {
  test('appSelector should return the app state', () => {
    expect(getApp(mockState)).toEqual(appState);
  });

  test('getEntities should return the entities state', () => {
    expect(getEntities(mockState)).toEqual(entitiesState);
  });

  test('getDataRequests should return the data requests state', () => {
    expect(getDataRequests(mockState)).toEqual(dataRequestsState);
  });

  test('getSession should return the session state', () => {
    expect(getSession(mockState)).toEqual(sessionState);
  });

  test('getActiveTransactionQueueId should return the active transaction queue id', () => {
    expect(getActiveTransactionQueueId(mockState)).toBe(
      appState.activeTransactionQueue
    );
  });

  test('getTransactionQueues should return the transaction queue entities', () => {
    expect(getTransactionQueues(mockState)).toEqual(
      entitiesState.transactionQueues
    );
  });

  test('getTransactions should return the transaction entities', () => {
    expect(getTransactions(mockState)).toEqual(entitiesState.transactions);
  });

  describe('selector creator: createGetActiveTransactionQueue', () => {
    test('should return the active transaction queue and transactions', () => {
      const expectedQueue = {
        ...transactionQueues.byId.tq0,
        transactions: [transactions.byId.t0, transactions.byId.t1],
      };

      expect(createGetActiveTransactionQueue()(mockState)).toEqual(
        expectedQueue
      );
    });

    test('should throw an error if the state is invalid', () => {
      let invalidState: RootState = {
        ...mockState,
        entities: {
          ...entitiesState,
          transactionQueues: {
            byId: {},
            allIds: [],
          },
        },
      };

      let expectedErrorMessage =
        'Invalid state. There is an active transaction queue id but no corresponding transaction queue entity.';

      expect(() =>
        createGetActiveTransactionQueue()(invalidState)
      ).toThrowError(expectedErrorMessage);

      invalidState = {
        ...mockState,
        entities: {
          ...entitiesState,
          transactions: {
            byId: {},
            allIds: [],
          },
        },
      };

      expectedErrorMessage =
        'Invalid state. There is an active transaction queue but no corresponding transaction entities.';

      expect(() =>
        createGetActiveTransactionQueue()(invalidState)
      ).toThrowError(expectedErrorMessage);
    });

    test('should return null if there is no active transaction queue', () => {
      const noActiveQueue: RootState = {
        ...mockState,
        app: {
          ...appState,
          activeTransactionQueue: undefined,
        },
      };

      expect(createGetActiveTransactionQueue()(noActiveQueue)).toBe(null);
    });
  });

  const fetcher1: Fetcher<typeof firstRequestArgs> = {
    entity: Entities.Checkpoints,
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: firstRequestArgs,
  };
  const fetcher2: Fetcher<typeof secondRequestArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'otherCheckpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: secondRequestArgs,
  };
  const fetcher3: Fetcher<typeof thirdRequestArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'stillOtherCheckpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: thirdRequestArgs,
  };

  const invalidFetcher1: Fetcher<typeof firstInvalidArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'moreCheckpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: firstInvalidArgs,
  };

  const invalidFetcher2: Fetcher<typeof secondInvalidArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'evenMoreCheckpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: secondInvalidArgs,
  };

  const sameEntityAsFetcher1: Fetcher<typeof secondRequestArgs> = {
    entity: Entities.Checkpoints,
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: secondRequestArgs,
  };

  const samePropKeyAsFetcher2: Fetcher<typeof firstRequestArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'otherCheckpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: firstRequestArgs,
  };

  const samePropKeyAsFetcher1Entity: Fetcher<typeof secondRequestArgs> = {
    entity: Entities.Checkpoints,
    propKey: 'checkpoints',
    requestKey: RequestKeys.GetCheckpointsBySymbol,
    args: secondRequestArgs,
  };

  describe('checkFetchersForDuplicates', () => {
    test('should throw an error if more than one fetcher has the same property key (propKey || entity)', () => {
      const expectedErrorMessage =
        'Cannot override fetched results. \
Make sure to use a different entity name in all of your \
fetchers. You can use `propKey` to override the name of the property that will hold the results.';

      expect(() =>
        checkFetchersForDuplicates(mockState, {
          fetchers: [fetcher1, sameEntityAsFetcher1],
        })
      ).toThrowError(expectedErrorMessage);

      expect(() =>
        checkFetchersForDuplicates(mockState, {
          fetchers: [fetcher1, samePropKeyAsFetcher1Entity],
        })
      ).toThrowError(expectedErrorMessage);

      expect(() =>
        checkFetchersForDuplicates(mockState, {
          fetchers: [fetcher2, samePropKeyAsFetcher2],
        })
      ).toThrowError(expectedErrorMessage);
    });

    test('should throw an error if more than one fetcher has the same request key and arguments', () => {
      const expectedErrorMessage =
        'Duplicate fetcher. Make sure you are \
not passing two fetchers with the same `requestKey` and arguments';

      expect(() =>
        checkFetchersForDuplicates(mockState, {
          fetchers: [fetcher1, fetcher1],
        })
      ).toThrowError(expectedErrorMessage);
    });
  });

  describe('Selector creator: createGetEntitiesFromCache', () => {
    test('should return the correct cached entities', () => {
      expect(createGetEntitiesFromCache()(mockState, { fetchers: [] })).toEqual(
        {}
      );

      expect(
        createGetEntitiesFromCache()(mockState, { fetchers: [fetcher1] })
      ).toEqual({
        checkpoints: [checkpoints.byId.c0],
      });

      expect(
        createGetEntitiesFromCache()(mockState, {
          fetchers: [fetcher1, fetcher2, fetcher3],
        })
      ).toEqual({
        checkpoints: [checkpoints.byId.c0],
        otherCheckpoints: [checkpoints.byId.c1],
        stillOtherCheckpoints: [checkpoints.byId.c0, checkpoints.byId.c1],
      });
    });

    test('entity arrays that are not cached should be empty', () => {
      expect(
        createGetEntitiesFromCache()(mockState, {
          fetchers: [invalidFetcher1, invalidFetcher2],
        })
      ).toEqual({
        moreCheckpoints: [],
        evenMoreCheckpoints: [],
      });
    });
  });

  describe('Selector creator: createGetCacheStatus', () => {
    test('should return the correct cache status', () => {
      expect(createGetCacheStatus()(mockState, { fetchers: [] })).toEqual([]);

      expect(
        createGetCacheStatus()(mockState, { fetchers: [fetcher1] })
      ).toEqual([
        {
          requestKey: fetcher1.requestKey,
          args: fetcher1.args,
          mustBeFetched: false,
        },
      ]);

      expect(
        createGetCacheStatus()(mockState, { fetchers: [invalidFetcher1] })
      ).toEqual([
        {
          requestKey: invalidFetcher1.requestKey,
          args: invalidFetcher1.args,
          mustBeFetched: true,
        },
      ]);

      expect(
        createGetCacheStatus()(mockState, {
          fetchers: [fetcher1, invalidFetcher1],
        })
      ).toEqual([
        {
          requestKey: fetcher1.requestKey,
          args: fetcher1.args,
          mustBeFetched: false,
        },
        {
          requestKey: invalidFetcher1.requestKey,
          args: invalidFetcher1.args,
          mustBeFetched: true,
        },
      ]);
    });
  });

  describe('Selector creator: createGetLoadingStatus', () => {
    test('should return true if data is being fetched', () => {
      const fetchingState = {
        ...mockState,
        dataRequests: {
          ...dataRequestsState,
          [RequestKeys.GetCheckpointsBySymbol]: {
            ...dataRequestsState[RequestKeys.GetCheckpointsBySymbol],
            [utils.hashObj(firstRequestArgs)]: {
              fetching: true,
              fetchedIds: ['c0'],
            },
          },
        },
      };

      expect(
        createGetLoadingStatus()(fetchingState, { fetchers: [fetcher1] })
      ).toEqual(true);
    });

    test('should return false if no fetchers are passed', () => {
      expect(createGetLoadingStatus()(mockState, { fetchers: [] })).toEqual(
        false
      );
    });

    test('should return false if all data has been loaded', () => {
      expect(
        createGetLoadingStatus()(mockState, { fetchers: [fetcher1] })
      ).toEqual(false);
    });
  });
});
