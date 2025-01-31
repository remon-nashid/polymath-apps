import Web3 from 'web3';
import { User } from '../../models';
import { verifySignature } from '../../utils';
import { applyHandler, checkForReservedTicker } from '../providers';

jest.mock('web3');

jest.mock('../../models/User', () => {
  return {
    User: {
      findOne: jest.fn(),
    },
  };
});

jest.mock('../../models/Provider', () => {
  return {
    Provider: {
      find: jest.fn(),
    },
  };
});

jest.mock('../../utils', () => {
  return {
    sendProviderApplicationEmail: jest.fn(),
    verifySignature: jest.fn(),
  };
});

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

const validAddress = '0xf55bcAA8a8AcF4aBA2edF74A50509358B96155b0';

const validEmail = 'jeremias@polymath.network';
const validName = 'Jeremías Díaz';
const validUser = {
  address: validAddress,
  email: validEmail,
  name: validName,
};

const returnValidUser = () => validUser;
const returnNull = () => null;

describe('Function: checkForReservedTicker', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('throws an error if the network id is invalid', async () => {
    expect(checkForReservedTicker(validAddress, '0')).rejects.toEqual(
      new Error('Invalid network id')
    );
  });
});

describe('Route: POST /providers/apply', () => {
  const generateInvalidRequestBodyTest = body => {
    return async () => {
      const ctx = {
        request: {
          body,
        },
      };

      await applyHandler(ctx);

      expect(ctx.body).toEqual({
        status: 'error',
        data: 'Invalid request body',
      });
    };
  };

  const validCode = 'c2dccbea5e17e2b4';
  const validSig =
    '0xc69e7dbed9982c5b68663824e346ab5d52f60265474bc21d4c82b77f01884cca225adc4299e18446509ede2c29c939da32e29230e239e92fbf88de7caff849231c';
  const validCompanyName = 'Some Company Name';
  const validIds = [1, 2, 3, 4];
  const validCompanyDesc = 'Some company description';
  const validOperatedIn = 'Some operation jurisdiction';
  const validIncorporatedIn = 'Some incorporation jurisdiction';
  const validProjectURL = 'http://www.some.project.url';
  const validProfilesURL = 'http://www.some.profiles.url';
  const validStructureURL = 'http://www.some.structure.url';
  const validOtherDetails = 'Some details';

  const validNetworkId = '15';

  const validBody = {
    code: validCode,
    sig: validSig,
    address: validAddress,
    companyName: validCompanyName,
    ids: validIds,
    companyDesc: validCompanyDesc,
    operatedIn: validOperatedIn,
    incorporatedIn: validIncorporatedIn,
    projectURL: validProjectURL,
    profilesURL: validProfilesURL,
    structureURL: validStructureURL,
    otherDetails: validOtherDetails,
    networkId: validNetworkId,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test(
    'responds with an error if the request body is not an object',
    generateInvalidRequestBodyTest(1)
  );

  test(
    'responds with an error if code is not a string',
    generateInvalidRequestBodyTest({
      code: 1,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if sig is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: 1,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if address is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: 1,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if companyName is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: 1,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if ids is not an array',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: 1,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if companyDesc is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: 1,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if operatedIn is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: 1,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if incorporatedIn is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: 1,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if projectURL is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: 1,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if profilesURL is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: 1,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if structureURL is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: 1,
      otherDetails: validOtherDetails,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if otherDetails is present but not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: 1,
      networkId: validNetworkId,
    })
  );

  test(
    'responds with an error if networkId is not a string',
    generateInvalidRequestBodyTest({
      code: validCode,
      sig: validSig,
      address: validAddress,
      companyName: validCompanyName,
      ids: validIds,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
      networkId: 1,
    })
  );

  test("responds with an error if signature can't be verified", async () => {
    const expectedError = {
      status: 'error',
      data: 'Some signing error',
    };

    verifySignature.mockImplementationOnce(() => expectedError);

    const ctx = {
      request: {
        body: validBody,
      },
    };

    await applyHandler(ctx);

    expect(ctx.body).toEqual(expectedError);
  });

  test('responds with an error if the user does not exist in the database', async () => {
    User.findOne.mockImplementationOnce(() => undefined);

    verifySignature.mockImplementationOnce(returnNull);

    const ctx = {
      request: {
        body: validBody,
      },
    };

    await applyHandler(ctx);

    expect(ctx.body).toEqual({
      status: 'error',
      data: 'Invalid user',
    });
  });

  test('responds with an error if the user has no reserved tickers', async () => {
    User.findOne.mockImplementation(returnValidUser);

    verifySignature.mockImplementation(returnNull);

    Web3.mockImplementation(() => {
      return {
        eth: {
          Contract: () => {
            return {
              getPastEvents: () => [],
              methods: {
                getAddress: () => {
                  return {
                    call: () => '0xffffffffffffffffffffffffffffffffffffffff',
                  };
                },
              },
            };
          },
        },
      };
    });

    const ctx = {
      request: {
        body: validBody,
      },
    };

    await applyHandler(ctx);

    expect(ctx.body).toEqual({
      status: 'error',
      data: 'No ticker was reserved',
    });
  });

  test('sends dummy email and responds with ok status in local', async () => {
    const requireModules = () => {
      jest.resetModules();
      return {
        User: require('../../models').User,
        Provider: require('../../models').Provider,
        verifySignature: require('../../utils').verifySignature,
        Web3: require('web3'),
        applyHandler: require('../providers').applyHandler,
        sendProviderApplicationEmail: require('../../utils')
          .sendProviderApplicationEmail,
      };
    };

    const returnMockWeb3Client = () => {
      return {
        eth: {
          Contract: () => {
            return {
              getPastEvents: () => ['Some random event'],
              methods: {
                getAddress: () => {
                  return {
                    call: () => '0xffffffffffffffffffffffffffffffffffffffff',
                  };
                },
              },
            };
          },
        },
      };
    };

    const expectedResponse = {
      status: 'ok',
      data: 'Application has been sent',
    };

    const validApplication = {
      companyName: validCompanyName,
      companyDesc: validCompanyDesc,
      operatedIn: validOperatedIn,
      incorporatedIn: validIncorporatedIn,
      projectURL: validProjectURL,
      profilesURL: validProfilesURL,
      structureURL: validStructureURL,
      otherDetails: validOtherDetails,
    };

    const expectedProvider1 = {
      name: 'Some name 1',
      email: 'some@email1.com',
    };

    const expectedProvider2 = {
      name: 'Some name 2',
      email: 'some@email2.com',
    };

    const expectedProvider3 = {
      name: 'Some name 3',
      email: 'some@email3.com',
    };

    const expectedProvider4 = {
      name: 'Some name 4',
      email: 'some@email4.com',
    };

    const expectedProviders = [
      expectedProvider1,
      expectedProvider2,
      expectedProvider3,
      expectedProvider4,
    ];

    // Prevent hoisting
    jest.mock('../../constants', () => {
      return {
        DEPLOYMENT_STAGE: 'production',
        NETWORKS: {
          '15': {
            name: 'mainnet',
            url: 'ws://some.url',
          },
        },
      };
    });

    let modules = requireModules();

    modules.User.findOne.mockImplementationOnce(returnValidUser);

    modules.Provider.find.mockImplementationOnce(() => expectedProviders);

    modules.verifySignature.mockImplementationOnce(returnNull);

    modules.Web3.mockImplementationOnce(returnMockWeb3Client);

    const newBody = { ...validBody };
    newBody.networkId = '1';
    let ctx = {
      request: {
        body: validBody,
      },
    };

    await modules.applyHandler(ctx);

    expect(modules.sendProviderApplicationEmail).toHaveBeenCalledTimes(4);
    expect(modules.sendProviderApplicationEmail).toHaveBeenLastCalledWith(
      expectedProvider4.email,
      expectedProvider4.name,
      validName,
      validEmail,
      validApplication,
      false
    );
    expect(ctx.body).toEqual(expectedResponse);

    ctx = {
      request: {
        body: validBody,
      },
    };

    // Prevent hoisting
    jest.doMock('../../constants', () => {
      return {
        DEPLOYMENT_STAGE: 'local',
        NETWORKS: {
          '15': {
            name: 'local',
            url: 'ws://some.url',
          },
        },
      };
    });

    modules = requireModules();

    modules.User.findOne.mockImplementationOnce(returnValidUser);

    modules.Provider.find.mockImplementationOnce(() => expectedProviders);

    modules.verifySignature.mockImplementationOnce(returnNull);

    modules.Web3.mockImplementationOnce(returnMockWeb3Client);

    await modules.applyHandler(ctx);

    expect(modules.sendProviderApplicationEmail).toHaveBeenLastCalledWith(
      validEmail,
      validName,
      validName,
      validEmail,
      validApplication,
      true
    );

    expect(ctx.body).toEqual(expectedResponse);
  });
});
