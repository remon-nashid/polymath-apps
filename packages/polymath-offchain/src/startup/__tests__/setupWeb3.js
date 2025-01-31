import {
  sendCappedSTOScheduledEmail,
  sendUSDTieredSTOScheduledEmail,
  sendTickerReservedEmail,
  sendTokenCreatedEmail,
} from '../../utils';
import logger from 'winston';
import { User } from '../../models';
import { NETWORKS, STO_MODULE_TYPE } from '../../constants';

jest.mock('../../utils', () => {
  return {
    sendCappedSTOScheduledEmail: jest.fn(),
    sendUSDTieredSTOScheduledEmail: jest.fn(),
    sendTickerReservedEmail: jest.fn(),
    sendTokenCreatedEmail: jest.fn(),
  };
});

jest.useFakeTimers();

jest.mock(
  '@polymathnetwork/polymath-scripts/fixtures/contracts/PolymathRegistry.json',
  () => {
    return {
      abi: {},
    };
  }
);

jest.mock(
  '@polymathnetwork/polymath-scripts/fixtures/contracts/SecurityTokenRegistry.json',
  () => {
    return {
      abi: {},
    };
  }
);

jest.mock(
  '@polymathnetwork/polymath-scripts/fixtures/contracts/SecurityToken.json',
  () => {
    return {
      abi: {},
    };
  }
);

jest.mock(
  '@polymathnetwork/polymath-scripts/fixtures/contracts/CappedSTO.json',
  () => {
    return {
      abi: {},
    };
  }
);

jest.mock('winston', () => {
  return {
    error: jest.fn(),
    info: jest.fn(),
  };
});

const socketEventListenerMock = jest.fn();
const isListeningMock = jest.fn();
const registerTickerListenerMock = jest.fn();
const moduleAddedListenerMock = jest.fn();
const newSecurityTokenListenerMock = jest.fn();
const getPastEventsMock = jest.fn().mockImplementation(() => []);
const getExpiryLimitCallMock = jest.fn();
const getExpiryLimitMock = jest.fn().mockImplementation(() => {
  return {
    call: getExpiryLimitCallMock,
  };
});
const startTimeCallMock = jest.fn();
const startTimeMock = jest.fn().mockImplementation(() => {
  return {
    call: startTimeCallMock,
  };
});
const detailsCallMock = jest.fn();
const detailsMock = jest.fn().mockImplementation(() => {
  return {
    call: detailsCallMock,
  };
});
const walletCallMock = jest.fn();
const walletMock = jest.fn().mockImplementation(() => {
  return {
    call: walletCallMock,
  };
});
const ownerCallMock = jest.fn();
const ownerMock = jest.fn().mockImplementation(() => {
  return {
    call: ownerCallMock,
  };
});
const getAddressCallMock = jest
  .fn()
  .mockImplementation(() => '0xffffffffffffffffffffffffffffffffffffffff');
const getAddressMock = jest.fn().mockImplementation(() => {
  return {
    call: getAddressCallMock,
  };
});
const contractMock = jest.fn().mockImplementation(() => {
  return {
    events: {
      RegisterTicker: registerTickerListenerMock,
      ModuleAdded: moduleAddedListenerMock,
      NewSecurityToken: newSecurityTokenListenerMock,
    },
    getPastEvents: getPastEventsMock,
    methods: {
      getExpiryLimit: getExpiryLimitMock,
      getSTODetails: detailsMock,
      startTime: startTimeMock,
      wallet: walletMock,
      owner: ownerMock,
      getAddress: getAddressMock,
    },
  };
});
const clientMock = {
  config: {
    closeTimeout: 5000,
  },
};
const connectionCloseMock = jest.fn();
const websocketProviderMock = jest.fn().mockImplementation(() => {
  return {
    on: socketEventListenerMock,
    connection: {
      CLOSED: 3,
      readyState: 0,
      _client: clientMock,
    },
  };
});
const hexToUtf8Mock = jest.fn();
const fromWeiMock = jest.fn().mockImplementation(number => number);
const constructorMock = jest.fn().mockImplementation(() => {
  return {
    eth: {
      net: {
        isListening: isListeningMock,
      },
      Contract: contractMock,
    },
    providers: {
      WebsocketProvider: websocketProviderMock,
    },
    currentProvider: {
      connection: {
        close: connectionCloseMock,
        CLOSING: 2,
        CLOSED: 3,
        readyState: 3,
        _client: clientMock,
      },
    },
  };
});

constructorMock.providers = {
  WebsocketProvider: websocketProviderMock,
};

constructorMock.utils = {
  hexToUtf8: hexToUtf8Mock,
  fromWei: fromWeiMock,
};

jest.doMock('web3', () => constructorMock);

const Web3 = require('web3');

jest.mock('../../models', () => {
  return {
    User: {
      findOne: jest.fn(),
    },
  };
});

describe('Function: connectWeb3', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('returns false if the connection could not be opened', async () => {
    const connectWeb3 = require('../setupWeb3').default;

    websocketProviderMock.mockImplementationOnce(() => {
      return {
        on: socketEventListenerMock,
        connection: {
          CLOSED: 3,
          readyState: 3,
          _client: clientMock,
        },
      };
    });

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    expect(websocketProviderMock).toHaveBeenCalledWith(
      NETWORKS[validNetworkId].url
    );
    expect(socketEventListenerMock).toHaveBeenCalledTimes(0);
    expect(connectionSuccessful).toBe(false);
  });

  test('connects to the provider and adds socket listeners', async () => {
    const connectWeb3 = require('../setupWeb3').default;

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);
    expect(websocketProviderMock).toHaveBeenCalledWith(
      NETWORKS[validNetworkId].url
    );
    expect(socketEventListenerMock).toHaveBeenCalledTimes(3);
    expect(socketEventListenerMock.mock.calls[0][0]).toBe('error');
    expect(socketEventListenerMock.mock.calls[1][0]).toBe('close');
    expect(socketEventListenerMock.mock.calls[2][0]).toBe('end');
  });

  test('pings the network every 5 seconds', async () => {
    isListeningMock.mockImplementation(() => true);

    const connectWeb3 = require('../setupWeb3').default;

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    jest.advanceTimersByTime(20000);

    expect(connectionSuccessful).toBe(true);
    expect(isListeningMock).toHaveBeenCalledTimes(4);
  });

  test('reconnects on socket error', async () => {
    let alreadyCalled = false;
    let eventListener = (event, callback) => {
      if (event === 'error' && !alreadyCalled) {
        alreadyCalled = true;
        callback(new Error('Something went wrong'));
      }
    };

    socketEventListenerMock
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener);

    let connectWeb3 = require('../setupWeb3').default;

    let connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    let connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      `[SETUP] Reconnecting LOCAL socket after error...`
    );

    jest.clearAllMocks();
    alreadyCalled = false;

    // web3 sometimes calls the listener callback with no error
    eventListener = (event, callback) => {
      if (event === 'error' && !alreadyCalled) {
        alreadyCalled = true;
        callback();
      }
    };

    socketEventListenerMock
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener);

    connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);

    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      `[SETUP] Reconnecting LOCAL socket after error...`
    );
  });

  test('reconnects on socket close', async () => {
    let alreadyCalled = false;
    const eventListener = (event, callback) => {
      if (event === 'close' && !alreadyCalled) {
        alreadyCalled = true;
        callback();
      }
    };
    socketEventListenerMock
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener);

    const connectWeb3 = require('../setupWeb3').default;

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      `[SETUP] Reconnecting LOCAL socket after close...`
    );
  });

  test('reconnects on socket end', async () => {
    let alreadyCalled = false;
    const eventListener = (event, callback) => {
      if (event === 'end' && !alreadyCalled) {
        alreadyCalled = true;
        callback();
      }
    };
    socketEventListenerMock
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener)
      .mockImplementationOnce(eventListener);

    const connectWeb3 = require('../setupWeb3').default;

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      `[SETUP] Reconnecting LOCAL socket after end...`
    );
  });

  test('logs blockchain listener errors', async () => {
    const expectedError = new Error('Something went wrong');
    contractMock.mockImplementationOnce(() => {
      throw expectedError;
    });

    const connectWeb3 = require('../setupWeb3').default;

    const connectPromise = connectWeb3(validNetworkId);

    jest.advanceTimersByTime(5000);

    const connectionSuccessful = await connectPromise;

    expect(connectionSuccessful).toBe(true);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });
});

describe('Function: reconnect', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('retries connection if provider is null', async () => {
    websocketProviderMock
      .mockImplementationOnce(() => {
        return {
          on: () => null,
          connection: {
            CLOSED: 3,
            readyState: 3,
            _client: clientMock,
          },
        };
      })
      .mockImplementationOnce(() => {
        return {
          on: () => null,
          connection: {
            CLOSED: 3,
            readyState: 0,
            _client: clientMock,
          },
        };
      });

    const reconnect = require('../setupWeb3').reconnect;

    const reconnecting = reconnect(validNetworkId);

    /**
      NOTE @monitz87: This is needed because of how jest timer mocks
      interact with promises (see https://stackoverflow.com/a/52196951)
     */
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    jest.advanceTimersByTime(5000);

    await reconnecting;

    expect(logger.info).toHaveBeenCalledWith(
      `[SETUP] Network LOCAL not found. Retrying connection...`
    );
  });
});

describe('Function: keepAlive', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('closes connection if web3 stops listening for peers', async () => {
    isListeningMock.mockImplementationOnce(() => false);

    const keepAlive = require('../setupWeb3').keepAlive;

    const client = new Web3();

    await keepAlive(client, validNetworkId);

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(connectionCloseMock).toHaveBeenCalledTimes(1);
  });

  test('reconnects on timeout if socket is closing or closed', async () => {
    isListeningMock.mockImplementationOnce(() => {
      throw new Error('TIMEOUT');
    });

    const keepAlive = require('../setupWeb3').keepAlive;

    const client = new Web3();

    const keepingAlive = keepAlive(client, validNetworkId);

    jest.advanceTimersByTime(5000);

    await keepingAlive;

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      '[SETUP] Reconnecting LOCAL socket after close...'
    );
  });

  test("doesn't reconnect on timeout if socket is open", async () => {
    isListeningMock.mockImplementationOnce(() => {
      throw new Error('TIMEOUT');
    });

    const keepAlive = require('../setupWeb3').keepAlive;

    Web3.mockImplementationOnce(() => {
      return {
        eth: {
          net: {
            isListening: isListeningMock,
          },
        },
        currentProvider: {
          connection: {
            CLOSING: 2,
            CLOSED: 3,
            readyState: 0,
            _client: clientMock,
          },
        },
      };
    });

    const client = new Web3();

    await keepAlive(client, validNetworkId);

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalledWith(
      '[SETUP] Reconnecting LOCAL socket after close...'
    );
  });

  test("doesn't throw an error if the connection is alive", async () => {
    isListeningMock.mockImplementationOnce(() => true);

    const keepAlive = require('../setupWeb3').keepAlive;

    const client = new Web3();

    await keepAlive(client, validNetworkId);

    expect(clearInterval).not.toHaveBeenCalled();
    expect(connectionCloseMock).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalledWith(
      '[SETUP] Reconnecting LOCAL socket after close...'
    );
  });
});

describe('Function: registerTickerHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  const validTicker = 'SOMETICKER';
  const validAddress = '0xffffffffffffffffffffffffffffffffffffffff';
  const validTxHash = '0xeeeeeeeeeeeeeeee';
  const validExpiryLimit = 15;
  const validExpiryLimitSeconds = validExpiryLimit * 60 * 60 * 24;
  const validResult = {
    returnValues: {
      _ticker: validTicker,
      _owner: validAddress,
    },
    transactionHash: validTxHash,
  };

  test('logs an error if the event failed', async () => {
    const expectedError = {
      message: 'Something went wrong',
    };

    const registerTickerHandler = require('../setupWeb3').registerTickerHandler;

    await registerTickerHandler(null, validNetworkId, expectedError, undefined);

    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test('logs an error if the registered ticker owner is not in the database', async () => {
    getExpiryLimitCallMock.mockImplementationOnce(() => validExpiryLimit);

    User.findOne.mockImplementationOnce(() => undefined);

    const registerTickerHandler = require('../setupWeb3').registerTickerHandler;

    const contract = contractMock();

    await registerTickerHandler(contract, validNetworkId, null, validResult);

    expect(logger.error).toHaveBeenCalledWith(
      `Owner not found for "${validTicker}" in LOCAL`
    );
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test('sends an email when a ticker is registered', async () => {
    const validEmail = 'jeremias@polymath.network';
    const validName = 'Jeremías Díaz';
    const validUser = {
      email: validEmail,
      name: validName,
    };

    getExpiryLimitCallMock.mockImplementationOnce(
      () => validExpiryLimitSeconds
    );

    User.findOne.mockImplementationOnce(() => validUser);

    const registerTickerHandler = require('../setupWeb3').registerTickerHandler;

    const contract = contractMock();

    await registerTickerHandler(contract, validNetworkId, null, validResult);

    expect(sendTickerReservedEmail).toHaveBeenCalledTimes(1);
    expect(sendTickerReservedEmail).toHaveBeenCalledWith(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validExpiryLimit,
      validNetworkId
    );
  });
});

describe('Function: addTickerRegisterListener', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('calls handler on event trigger', async () => {
    const expectedError = new Error('Nothing to see here');
    registerTickerListenerMock.mockImplementationOnce((options, callback) => {
      callback(expectedError, null);
    });

    const addTickerRegisterListener = require('../setupWeb3')
      .addTickerRegisterListener;

    await addTickerRegisterListener(validNetworkId);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });
});

describe('Function: addSTOListeners', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('logs an error if getPastEvents fails', async () => {
    const expectedError = new Error('Something went wrong');

    getPastEventsMock.mockImplementationOnce(options => {
      throw expectedError;
    });

    const addSTOListeners = require('../setupWeb3').addSTOListeners;

    await addSTOListeners(validNetworkId);

    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test('creates STO listeners for each registered token', async () => {
    const validTokenAddress1 = '0x1';
    const validTokenAddress2 = '0x2';
    const validTokenAddress3 = '0x3';
    const validTokenAddress4 = '0x4';
    const validTicker1 = 'SOMETICKER1';
    const validTicker2 = 'SOMETICKER2';
    const validTicker3 = 'SOMETICKER3';
    const validTicker4 = 'SOMETICKER4';

    const validEvents = [
      {
        returnValues: {
          _securityTokenAddress: validTokenAddress1,
          _ticker: validTicker1,
        },
      },
      {
        returnValues: {
          _securityTokenAddress: validTokenAddress2,
          _ticker: validTicker2,
        },
      },
      {
        returnValues: {
          _securityTokenAddress: validTokenAddress3,
          _ticker: validTicker3,
        },
      },
      {
        returnValues: {
          _securityTokenAddress: validTokenAddress4,
          _ticker: validTicker4,
        },
      },
    ];

    getPastEventsMock.mockImplementationOnce(options => {
      return validEvents;
    });

    const addSTOListeners = require('../setupWeb3').addSTOListeners;

    await addSTOListeners(validNetworkId);

    expect(contractMock).toHaveBeenCalledTimes(6);
    expect(contractMock.mock.calls[0][1]).toEqual(
      NETWORKS['15'].polymathRegistryAddress
    );
    expect(contractMock.mock.calls[1][1]).toEqual(getAddressMock().call());
    expect(contractMock.mock.calls[2][1]).toEqual(validTokenAddress1);
    expect(contractMock.mock.calls[3][1]).toEqual(validTokenAddress2);
    expect(contractMock.mock.calls[4][1]).toEqual(validTokenAddress3);
    expect(contractMock.mock.calls[5][1]).toEqual(validTokenAddress4);
    expect(moduleAddedListenerMock).toHaveBeenCalledTimes(4);
  });
});

describe('Function: moduleAddedHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  const validTicker = 'SOMETICKER';

  const validHexName = '0xffffffffffffffff';
  const validModuleAddress = '0x1111111111111111111111111111111111111111';
  const validTypes = [STO_MODULE_TYPE];
  const validTxHash = '0x2222222222222222';

  const validWalletAddress = '0xfffffffffffffffffffffffffffffffffffffffffff';

  const validStart = 1;
  const validCap = 10000000;
  const validRate = 1000;
  const validIsPolyFundraise = true;
  const validOwner = '0xffffffffffffffffffffffffffffffffffffffff';

  const validDetails = {
    '0': validStart,
    '2': validCap,
    '3': validRate,
    '7': validIsPolyFundraise,
  };

  const validResult = {
    returnValues: {
      _name: validHexName,
      _module: validModuleAddress,
      _types: validTypes,
    },
    transactionHash: validTxHash,
  };

  const validEmail = 'jeremias@polymath.network';
  const validName = 'Jeremías Díaz';
  const validUser = {
    email: validEmail,
    name: validName,
  };

  test('logs an error if the event failed', async () => {
    const expectedError = new Error('Something went wrong');
    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    await moduleAddedHandler(null, null, validNetworkId, expectedError, null);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });

  test('returns if the added module is not an STO module', async () => {
    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    await moduleAddedHandler(null, null, validNetworkId, null, {
      returnValues: {
        _name: validHexName,
        _module: validModuleAddress,
        _types: [],
      },
    });

    expect(hexToUtf8Mock).not.toHaveBeenCalled();
  });

  test("returns if the added STO doesn't have an email template", async () => {
    hexToUtf8Mock.mockImplementationOnce(() => 'UnsupportedSTOModule');

    User.findOne.mockImplementationOnce(() => validUser);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(contract, null, validNetworkId, null, validResult);

    expect(hexToUtf8Mock).toHaveBeenCalledTimes(1);
    expect(detailsCallMock).not.toHaveBeenCalled();
  });

  test('logs an error if getCappedSTODetails fails', async () => {
    const expectedError = new Error('Something went wrong');

    hexToUtf8Mock.mockImplementationOnce(() => 'CappedSTO');
    detailsCallMock.mockImplementationOnce(() => {
      throw expectedError;
    });
    ownerCallMock.mockImplementationOnce(() => Promise.resolve(validOwner));

    User.findOne.mockImplementationOnce(() => validUser);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(
      contract,
      validTicker,
      validNetworkId,
      null,
      validResult
    );

    expect(hexToUtf8Mock).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });

  test('logs an error if getUSDTieredSTODetails fails', async () => {
    const expectedError = new Error('Something went wrong');

    hexToUtf8Mock.mockImplementationOnce(() => 'USDTieredSTO');
    startTimeCallMock.mockImplementationOnce(() => {
      throw expectedError;
    });
    ownerCallMock.mockImplementationOnce(() => Promise.resolve(validOwner));

    User.findOne.mockImplementationOnce(() => validUser);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(
      contract,
      validTicker,
      validNetworkId,
      null,
      validResult
    );

    expect(hexToUtf8Mock).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });

  test('logs an error if the token owner is not in the database', async () => {
    ownerCallMock.mockImplementationOnce(() => Promise.resolve(validOwner));

    User.findOne.mockImplementationOnce(() => undefined);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(
      contract,
      validTicker,
      validNetworkId,
      null,
      validResult
    );

    expect(ownerCallMock).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      `Owner not found for ${validTicker} in LOCAL`
    );
  });

  test('sends email to issuer with Capped STO information', async () => {
    hexToUtf8Mock.mockImplementationOnce(() => 'CappedSTO');
    detailsCallMock.mockImplementationOnce(() => {
      return validDetails;
    });
    walletCallMock.mockImplementationOnce(() => validWalletAddress);
    ownerCallMock.mockImplementationOnce(() => Promise.resolve(validOwner));

    User.findOne.mockImplementationOnce(() => validUser);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(
      contract,
      validTicker,
      validNetworkId,
      null,
      validResult
    );

    expect(sendCappedSTOScheduledEmail).toHaveBeenCalledTimes(1);
    expect(sendCappedSTOScheduledEmail).toHaveBeenCalledWith(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validCap,
      validWalletAddress,
      validIsPolyFundraise,
      validRate,
      validStart,
      validNetworkId
    );
  });

  test('sends email to issuer with USD Tiered STO information', async () => {
    hexToUtf8Mock.mockImplementationOnce(() => 'USDTieredSTO');
    startTimeCallMock.mockImplementationOnce(() => {
      return validStart;
    });
    walletCallMock.mockImplementationOnce(() => validWalletAddress);
    ownerCallMock.mockImplementationOnce(() => Promise.resolve(validOwner));

    User.findOne.mockImplementationOnce(() => validUser);

    const moduleAddedHandler = require('../setupWeb3').moduleAddedHandler;

    const contract = contractMock();

    await moduleAddedHandler(
      contract,
      validTicker,
      validNetworkId,
      null,
      validResult
    );

    expect(sendUSDTieredSTOScheduledEmail).toHaveBeenCalledTimes(1);
    expect(sendUSDTieredSTOScheduledEmail).toHaveBeenCalledWith(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validWalletAddress,
      validStart,
      validNetworkId
    );
  });
});

describe('Function: addSTOListener', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';
  const validTicker = 'SOMETICKER';

  test('calls handler with contract and ticker on event trigger', () => {
    const expectedError = new Error('Nothing to see here');
    moduleAddedListenerMock.mockImplementationOnce((options, callback) => {
      callback(expectedError, null);
    });

    const addSTOListener = require('../setupWeb3').addSTOListener;

    const contract = contractMock();

    addSTOListener(contract, validTicker, validNetworkId);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });
});

describe('Function: newSecurityTokenHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  const validTicker = 'SOMETICKER';
  const validAddress = '0xffffffffffffffffffffffffffffffffffffffff';
  const validTxHash = '0xeeeeeeeeeeeeeeee';
  const validOwner = '0xffffffffffffffffffffffffffffffffffffffff';

  const validResult = {
    returnValues: {
      _securityTokenAddress: validAddress,
      _ticker: validTicker,
      _owner: validOwner,
    },
    transactionHash: validTxHash,
  };

  test('logs an error if the event failed', async () => {
    const expectedError = new Error('Something went wrong');
    const newSecurityTokenHandler = require('../setupWeb3')
      .newSecurityTokenHandler;

    await newSecurityTokenHandler(null, validNetworkId, expectedError, null);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });

  test('logs an error if the token owner is not in the database', async () => {
    User.findOne.mockImplementationOnce(() => undefined);

    const newSecurityTokenHandler = require('../setupWeb3')
      .newSecurityTokenHandler;

    const contract = contractMock();

    await newSecurityTokenHandler(contract, validNetworkId, null, validResult);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      `Owner not found for ${validTicker} in LOCAL`
    );
  });

  test('sends email to user with token information and adds STO listener', async () => {
    const validEmail = 'jeremias@polymath.network';
    const validName = 'Jeremías Díaz';
    const validUser = {
      email: validEmail,
      name: validName,
    };

    User.findOne.mockImplementationOnce(() => validUser);

    const newSecurityTokenHandler = require('../setupWeb3')
      .newSecurityTokenHandler;

    const contract = contractMock();

    await newSecurityTokenHandler(contract, validNetworkId, null, validResult);

    expect(sendTokenCreatedEmail).toHaveBeenCalledTimes(1);
    expect(sendTokenCreatedEmail).toHaveBeenCalledWith(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validNetworkId
    );
    expect(moduleAddedListenerMock).toHaveBeenCalledTimes(1);
  });
});

describe('Function: addTokenCreateListener', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  const validNetworkId = '15';

  test('calls handler on event trigger', async () => {
    const expectedError = new Error('Nothing to see here');
    newSecurityTokenListenerMock.mockImplementationOnce((options, callback) => {
      callback(expectedError, null);
    });

    const addTokenCreateListener = require('../setupWeb3')
      .addTokenCreateListener;

    await addTokenCreateListener(validNetworkId);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expectedError.message,
      expectedError
    );
  });
});
