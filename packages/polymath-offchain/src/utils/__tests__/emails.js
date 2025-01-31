import {
  sendProviderApplicationEmail,
  sendAccountConfirmationEmail,
  sendCappedSTOScheduledEmail,
  sendUSDTieredSTOScheduledEmail,
  sendTickerReservedEmail,
  sendTokenCreatedEmail,
} from '../emails';
import ReactDOMServer from 'react-dom/server';
import sgMail from '@sendgrid/mail';

jest.mock('react-dom/server', () => {
  return {
    renderToStaticMarkup: jest.fn(),
  };
});

jest.mock('../../emails', () => {
  return {
    ProviderApplication: jest.fn(),
    TickerReserved: jest.fn(),
    TokenCreated: jest.fn(),
    CappedSTOScheduled: jest.fn(),
    USDTieredSTOScheduled: jest.fn(),
    AccountConfirmation: jest.fn(),
  };
});

jest.mock('@sendgrid/mail');

jest.mock('winston');

const validEmail = 'jeremias@polymath.network';
const validName = 'Jeremías Díaz';
const polymathEmail = 'noreply@polymath.network';
const polymathName = 'Polymath Network';
const replyToEmail = 'tokenstudio@polymath.network';
const validMarkup = '<html></html>';

const returnValidMarkup = () => validMarkup;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Function: sendEmail', () => {
  const requireModules = () => {
    jest.resetModules();
    return {
      ReactDOMServer: require('react-dom/server'),
      sgMail: require('@sendgrid/mail'),
      logger: require('winston'),
      sendEmail: require('../emails').sendEmail,
    };
  };

  const validSubject = 'Some subject';

  const generateExpectedMsg = () => {
    return {
      from: { email: polymathEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      replyTo: {
        email: replyToEmail,
        name: polymathName,
      },
      subject: validSubject,
      html: validMarkup,
    };
  };

  const validReplyTo = {
    name: validName,
    email: validEmail,
  };

  test('sends email when SENDGRID_API_KEY is set', async () => {
    jest.doMock('../../constants', () => {
      return {
        SENDGRID_API_KEY: 'SOME_API_KEY',
      };
    });

    const expectedMsg = generateExpectedMsg();

    let modules = requireModules();

    modules.ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await modules.sendEmail(validEmail, validName, validSubject, validMarkup);

    expect(modules.sgMail.send).toHaveBeenCalledWith(expectedMsg);

    expectedMsg.replyTo = validReplyTo;

    modules.ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    modules.sgMail.send.mockClear();

    await modules.sendEmail(
      validEmail,
      validName,
      validSubject,
      validMarkup,
      validReplyTo
    );

    expect(modules.sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });

  test('logs email to the console when SENDGRID_API_KEY is not set', async () => {
    jest.doMock('../../constants', () => {
      return {
        SENDGRID_API_KEY: undefined,
      };
    });

    const expectedMsg = generateExpectedMsg();

    let modules = requireModules();

    modules.ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await modules.sendEmail(validEmail, validName, validSubject, validMarkup);

    expect(modules.logger.warn).toHaveBeenCalledTimes(2);
    expect(modules.logger.warn.mock.calls[0][0]).toBe(
      'Not sending email since SENDGRID_API_KEY is not set.'
    );
    expect(JSON.parse(modules.logger.warn.mock.calls[1][0])).toEqual(
      expectedMsg
    );

    expectedMsg.replyTo = validReplyTo;

    modules.ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    modules.logger.warn.mockClear();

    await modules.sendEmail(
      validEmail,
      validName,
      validSubject,
      validMarkup,
      validReplyTo
    );

    expect(modules.logger.warn).toHaveBeenCalledTimes(2);
    expect(modules.logger.warn.mock.calls[0][0]).toBe(
      'Not sending email since SENDGRID_API_KEY is not set.'
    );
    expect(JSON.parse(modules.logger.warn.mock.calls[1][0])).toEqual(
      expectedMsg
    );
  });
});

describe('Function: sendProviderApplicationEmail', () => {
  const validApplication = {
    companyName: 'Some Company Name',
    companyDesc: 'Some company desc',
    operatedIn: 'Some operation jurisdiction',
    incorporatedIn: 'Some incorporation jurisdiction',
    projectURL: 'http://www.some.project.url',
    profilesURL: 'http://www.some.profiles.url',
    structureURL: 'http://www.some.structure.url',
    otherDetails: 'Some details',
  };

  const validProviderEmail = 'some@provider.email';
  const validProviderName = 'Some Provider Name';

  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: {
        name: validName,
        email: validEmail,
      },
      to: { name: validProviderName, email: validProviderEmail },
      subject: `${validApplication.companyName} is interested in your services`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendProviderApplicationEmail(
      validProviderEmail,
      validProviderName,
      validName,
      validEmail,
      validApplication,
      false
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });

  test('adds a DEMO tag to the subject if dummy is true', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: {
        name: validName,
        email: validEmail,
      },
      to: { name: validName, email: validEmail },
      subject: `DEMO: ${
        validApplication.companyName
      } is interested in your services`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendProviderApplicationEmail(
      validEmail,
      validName,
      validName,
      validEmail,
      validApplication,
      true
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});

const validTxHash = '0xffffffffffffffff';
const validTicker = 'SOMETICKER';

describe('Function: sendTickerReservedEmail', () => {
  const validExpiryLimit = 15;

  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: { email: replyToEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      subject: `${validTicker} Symbol Reserved on Polymath`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendTickerReservedEmail(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validExpiryLimit
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});

describe('Function: sendTokenCreateEmail', () => {
  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: { email: replyToEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      subject: `${validTicker} Token Created on Polymath`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendTokenCreatedEmail(
      validEmail,
      validName,
      validTxHash,
      validTicker
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});

describe('Function: sendCappedSTOScheduledEmail', () => {
  const validCap = 100000000;
  const validFundsReceiver = '0xffffffffffffffffffffffffffffffffffffffff';
  const validIsPolyFundraise = true;
  const validRate = 1000;
  const validStart = new Date('10/14/1987');

  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: { email: replyToEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      subject: `${validTicker} STO Created on Polymath`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendCappedSTOScheduledEmail(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validCap,
      validFundsReceiver,
      validIsPolyFundraise,
      validRate,
      validStart
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});

describe('Function: sendUSDTieredSTOScheduledEmail', () => {
  const validFundsReceiver = '0xffffffffffffffffffffffffffffffffffffffff';
  const validStart = new Date('10/14/1987');

  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: { email: replyToEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      subject: `${validTicker} STO Created on Polymath`,
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendUSDTieredSTOScheduledEmail(
      validEmail,
      validName,
      validTxHash,
      validTicker,
      validFundsReceiver,
      validStart
    );

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});

describe('Function: sendAccountConfirmationEmail', () => {
  const validPIN = '0xffffffffffffffff';

  test('calls sgMail.send with correct parameters', async () => {
    const expectedMsg = {
      from: { email: polymathEmail, name: polymathName },
      replyTo: { email: replyToEmail, name: polymathName },
      to: { email: validEmail, name: validName },
      subject: 'Confirm your account on Polymath',
      html: validMarkup,
    };

    ReactDOMServer.renderToStaticMarkup.mockImplementationOnce(
      returnValidMarkup
    );

    await sendAccountConfirmationEmail(validEmail, validName, validPIN);

    expect(sgMail.send).toHaveBeenCalledWith(expectedMsg);
  });
});
