// @flow

import Router from 'koa-router';
import { DEPLOYMENT_STAGE, NETWORKS } from '../constants';
import Web3 from 'web3';
import { User, Provider } from '../models';
import { sendProviderApplicationEmail, verifySignature } from '../utils';
import PolymathRegistryArtifact from '@polymathnetwork/polymath-scripts/fixtures/contracts/PolymathRegistry.json';
import SecurityTokenRegistryArtifact from '@polymathnetwork/polymath-scripts/fixtures/contracts/SecurityTokenRegistry.json';

import type { Context } from 'koa';

const providersRouter = new Router();

type ApplyRequestBody = {
  code: string,
  sig: string,
  address: string,
  companyName: string,
  ids: Array<number>,
  companyDesc: string,
  operatedIn: string,
  incorporatedIn: string,
  projectURL: string,
  profilesURL: string,
  structureURL: string,
  otherDetails?: string,
  networkId: string,
};

/**
 * Validates that the request parameters are typed correctly
 *
 * TODO @monitz87: add value validations as well
 */
const isApplyRequestValid = (body: ApplyRequestBody | any) => {
  if (typeof body !== 'object') {
    return false;
  }

  return Object.keys(body).every(key => {
    const value = body[key];
    if (key === 'ids') {
      return Array.isArray(value) && value.every(id => typeof id === 'number');
    } else if (key === 'otherDetails') {
      return !value || typeof value === 'string';
    }

    return typeof value === 'string';
  });
};

/**
 * Throws an error if a ticker hasn't been reserved for the given address
 *
 * TODO @monitz87: remake this when we rework polymath-js
 *
 * @param {string} address client's ethereum address
 * @param {string} networkId id of the network where the ticker will be checked
 */
export const checkForReservedTicker = async (
  address: string,
  networkId: string
) => {
  const networkData = NETWORKS[networkId];

  if (!networkData || !networkData.url) {
    throw new Error('Invalid network id');
  }

  const web3Client = new Web3(networkData.url);
  const polymathRegistry = new web3Client.eth.Contract(
    PolymathRegistryArtifact.abi,
    networkData.polymathRegistryAddress
  );

  const strAddress = await polymathRegistry.methods
    .getAddress('SecurityTokenRegistry')
    .call();

  const securityTokenRegistry = new web3Client.eth.Contract(
    SecurityTokenRegistryArtifact.abi,
    strAddress
  );

  const events = await securityTokenRegistry.getPastEvents('RegisterTicker', {
    filter: { _owner: address },
    fromBlock: 0,
    toBlock: 'latest',
  });

  if (!events.length) {
    throw new Error('No ticker was reserved');
  }
};

/**
 * POST /providers/apply
 *
 * Provider application route handler. Receives form data and an array of the ids of the providers to send email applications to.
 * It checks if the client has a reserved ticker and sends the corresponding emails.
 *
 * If the request body is invalid, the response is
 *
 * {
 *   status: 'error',
 *   data: 'Invalid request body
 * }
 *
 * If the client didn't sign the verification code or the signature is not valid, the response will contain an error.
 *
 * If the code doesn't match the address in our database, the response is
 *
 * {
 *   status: 'error',
 *   data: 'Code is not valid'
 * }
 *
 * If the signature is invalid, the response is
 *
 * {
 *   status: 'error',
 *   data: 'Sig is not valid'
 * }
 *
 * If there is no user with that Ethereum address in our database, the response is
 *
 * {
 *   status: 'error',
 *   data: 'Invalid user'
 * }
 *
 * If the issuer has no reserved tickers, the response is
 *
 * {
 *   status 'error',
 *   data: 'No ticker was reserved'
 * }
 *
 * Otherwise, the response is
 *
 * {
 *   status: 'ok',
 *   data: 'Application has been sent',
 * }
 *
 * @param {string} code polymath verification code
 * @param {string} sig signature
 * @param {string} address issuer ethereum address
 * @param {string} companyName client company name
 * @param {Array} ids array of the ids of the providers whose services the client is applying to
 * @param {string} companyDesc description of the company
 * @param {string} operatedIn juristidction of operation
 * @param {string} incorporatedIn jurisdiction of incorporation
 * @param {string} projectURL project presentation URL
 * @param {string} profilesURL board member profiles URL
 * @param {string} structureURL corporate structure URL
 * @param {string} otherDetails more details about the company
 * @param {string} networkId id of the network the client is connected to
 */
export const applyHandler = async (ctx: Context) => {
  let body = ctx.request.body;

  if (!isApplyRequestValid(body)) {
    ctx.body = {
      status: 'error',
      data: 'Invalid request body',
    };
    return;
  }

  body = ((body: any): ApplyRequestBody);

  const {
    code,
    sig,
    address,
    companyName,
    ids,
    companyDesc,
    operatedIn,
    incorporatedIn,
    projectURL,
    profilesURL,
    structureURL,
    otherDetails,
    networkId,
  } = body;

  const error = await verifySignature(code, sig, address);
  if (error) {
    ctx.body = error;
    return;
  }

  const user = await User.findOne({ address });

  if (!user) {
    ctx.body = {
      status: 'error',
      data: 'Invalid user',
    };
    return;
  }

  /**
   * Return an error if issuer hasn't reserved any tickers
   */
  try {
    await checkForReservedTicker(address, networkId);
  } catch (error) {
    ctx.body = {
      status: 'error',
      data: error.message,
    };
    return;
  }

  const application = {
    companyName,
    companyDesc,
    operatedIn,
    incorporatedIn,
    projectURL,
    profilesURL,
    structureURL,
    otherDetails,
  };

  const { name: userName, email: userEmail } = user;
  if (
    DEPLOYMENT_STAGE === 'production' &&
    NETWORKS[networkId].name === 'mainnet'
  ) {
    // Send emails to all selected providers
    const providers = await Provider.find({ id: { $in: ids } });
    for (let provider of providers) {
      const { name: providerName, email: providerEmail } = provider;
      await sendProviderApplicationEmail(
        providerEmail,
        providerName,
        userName,
        userEmail,
        application,
        false
      );
    }
  } else {
    // Send dummy email to the issuer instead of the provider
    await sendProviderApplicationEmail(
      userEmail,
      userName,
      userName,
      userEmail,
      application,
      true
    );
  }

  ctx.body = {
    status: 'ok',
    data: 'Application has been sent',
  };
};

/**
 * Provider application route
 */
providersRouter.post('/providers/apply', applyHandler);

export { providersRouter };
