import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Form, Button } from 'carbon-components-react';
import {
  Box,
  Grid,
  FormItem,
  FormItemGroup,
  Heading,
  TextInput,
  DatePickerInput,
  TimePickerSelect,
  NumberInput,
  CurrencySelect,
  ToggleInput,
  Remark,
  RaisedAmount,
  Tooltip,
} from '@polymathnetwork/ui';
import { format } from '@polymathnetwork/shared/utils';
import validator from '@polymathnetwork/ui/validator';
import {
  validateTodayOrAfter,
  validateStartTime,
  validateEndDate,
  validateEndTime,
  REQUIRED_MESSAGE,
  MORE_THAN_MESSAGE,
  ADDRESS_MESSAGE,
  MAX_DIGITS_MESSAGE,
} from '../../validators';
import { toWei } from '../../../../../../utils/contracts';
import { FUND_RAISE_TYPES } from '../../../../../../constants';
import { configureSTO } from '../../../../../../actions/sto';

const formSchema = validator.object().shape({
  date: validator.object().shape({
    startDate: validator
      .date()
      .isRequired(REQUIRED_MESSAGE)
      .test('validateStartDate', validateTodayOrAfter),
    startTime: validator
      .number()
      .isRequired(REQUIRED_MESSAGE)
      .test('validateStartTime', validateStartTime),
    endDate: validator
      .date()
      .isRequired(REQUIRED_MESSAGE)
      .test('validateEndDate', validateEndDate),
    endTime: validator
      .number()
      .isRequired(REQUIRED_MESSAGE)
      .test('validEndTime', validateEndTime),
  }),
  currency: validator.string().isRequired(REQUIRED_MESSAGE),
  cap: validator
    .bigNumber()
    .isRequired(REQUIRED_MESSAGE)
    .maxDigits(21, MAX_DIGITS_MESSAGE)
    .moreThan(0, MORE_THAN_MESSAGE),
  rate: validator
    .bigNumber()
    .isRequired(REQUIRED_MESSAGE)
    .maxDigits(21, MAX_DIGITS_MESSAGE)
    .moreThan(0, MORE_THAN_MESSAGE),
  receiverAddress: validator
    .string()
    .isRequired(REQUIRED_MESSAGE)
    .isAddress(ADDRESS_MESSAGE),
});

/**
 * NOTE @monitz87: Every field NEEDS to have an initial value because of
 * https://github.com/jaredpalmer/formik/issues/738
 */
const initialValues = {
  date: {
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
  },
  currency: 'POLY',
  cap: null,
  rate: null,
  receiverAddress: '',
  deployLegacy: false,
};

export const CappedSTOFormComponent = ({
  ticker,
  values,
  errors,
  touched,
  handleSubmit,
  networkId,
}) => {
  const { cap, rate, currency } = values;

  let totalTokensAmount = new BigNumber(0),
    totalRaiseAmount = new BigNumber(0);

  if (cap && rate) {
    totalTokensAmount = new BigNumber(cap);
    totalRaiseAmount = totalTokensAmount.dividedBy(new BigNumber(rate));
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Heading variant="h3">STO Schedule</Heading>
      <FormItemGroup>
        <FormItemGroup.Items>
          <FormItem name="date.startDate">
            <FormItem.Label>Start Date</FormItem.Label>
            <FormItem.Input
              component={DatePickerInput}
              placeholder="mm / dd / yyyy"
            />
          </FormItem>
          <Box mr={4}>
            <FormItem name="date.startTime">
              <FormItem.Label>Time</FormItem.Label>
              <FormItem.Input
                component={TimePickerSelect}
                placeholder="hh:mm"
              />
            </FormItem>
          </Box>
          <FormItem name="date.endDate">
            <FormItem.Label>End Date</FormItem.Label>
            <FormItem.Input
              component={DatePickerInput}
              placeholder="mm / dd / yyyy"
            />
          </FormItem>
          <FormItem name="date.endTime">
            <FormItem.Label>Time</FormItem.Label>
            <FormItem.Input component={TimePickerSelect} placeholder="hh:mm" />
          </FormItem>
        </FormItemGroup.Items>
        <FormItemGroup.Error name="date" errors={errors} touched={touched} />
      </FormItemGroup>
      <Heading variant="h3" mt={5}>
        STO Financing Details & Terms
      </Heading>

      <Grid>
        <FormItem name="currency">
          <FormItem.Input
            component={CurrencySelect}
            placeholder="Raise in"
            options={['ETH', 'POLY']}
          />
          <FormItem.Error />
        </FormItem>
        <FormItem name="cap">
          <FormItem.Label>
            <Tooltip triggerText="Hard Cap (in Tokens)">
              <p>
                <strong>Hard Cap (in Tokens)</strong>
              </p>
              <p>
                Hard Cap is the maximum number of tokens available through this
                offering. e.g. if you want the total aggregate of your investors
                in this offering to own 10 million tokens, enter 10000000.
              </p>
            </Tooltip>
          </FormItem.Label>
          <FormItem.Input
            component={NumberInput}
            placeholder="Enter amount"
            useBigNumbers
          />
          <FormItem.Error />
        </FormItem>
        <FormItem name="rate">
          <FormItem.Label>
            <Tooltip triggerText="Rate">
              <p>
                <strong>Rate</strong>
              </p>
              <p>
                Conversion rate between the currency you chose and your Security
                Token. E.g. 1000 means that 1 ETH (or POLY) will buy 1000
                Security Tokens.
              </p>
            </Tooltip>
          </FormItem.Label>
          <FormItem.Input
            component={NumberInput}
            placeholder="Enter amount"
            maxDecimals={2}
            useBigNumbers
          />
          <FormItem.Error />
        </FormItem>
        <Grid gridAutoFlow="column" gridAutoColumns="1fr">
          <Grid.Item gridColumn="span 3 / 5">
            <RaisedAmount
              title="Amount Of Funds the STO Will Raise"
              primaryAmount={format.toTokens(totalRaiseAmount, {
                decimals: 6,
                precision: 20,
              })}
              primaryUnit={currency}
              tokenAmount={totalTokensAmount}
              tokenUnit={ticker.toUpperCase()}
            />
          </Grid.Item>
        </Grid>
      </Grid>
      <Heading variant="h3" mt={5}>
        ETH Addresses
      </Heading>
      <Remark title="Note">
        Before we write this address to the blockchain, we recommend that you
        test sending to and retrieving funds from it to make sure it corresponds
        to the wallet you would like to use.
      </Remark>
      <FormItem name="receiverAddress">
        <FormItem.Label>
          <Tooltip triggerText="ETH Address to receive the funds raised during the STO">
            <p>
              <strong>Fund Receiver Address</strong>
            </p>
            <p>
              This wallet address will receive the funds raised during the STO.
              This address may be self-custodied or that of a fully custodied
              wallet.
            </p>
          </Tooltip>
        </FormItem.Label>
        <FormItem.Input
          component={TextInput}
          placeholder="Enter your current ETH address"
        />
        <FormItem.Error />
      </FormItem>
      {networkId === 42 && (
        <FormItem name="deployLegacy">
          <FormItem.Label>
            Deploy legacy version (for inner testing)
          </FormItem.Label>
          <FormItem.Input component={ToggleInput} />
        </FormItem>
      )}
      <Button type="submit">Confirm & launch STO</Button>
    </Form>
  );
};

const mapStateToProps = ({
  sto: {
    factory: { address },
  },
  token: {
    token: { ticker },
  },
  network: { id: networkId },
}) => ({ address, ticker, networkId });

const formikEnhancer = withFormik({
  validationSchema: formSchema,
  displayName: 'CappedSTOConfigForm',
  validateOnChange: false,
  mapPropsToValues: () => {
    return initialValues;
  },
  handleSubmit: (values, { props }) => {
    const { dispatch } = props;

    const legacy = values.deployLegacy;
    const rate = values.rate.toString();

    const formattedValues = {
      startsAt:
        moment(values.date.startDate).unix() * 1000 + values.date.startTime,
      endsAt: moment(values.date.endDate).unix() * 1000 + values.date.endTime,
      cap: toWei(values.cap),
      rate: legacy ? rate : toWei(rate),
      currencies: [FUND_RAISE_TYPES[values.currency]],
      receiverAddress: values.receiverAddress,
    };

    const config = {
      data: formattedValues,
      legacy: values.deployLegacy,
    };

    dispatch(configureSTO(config, 'CappedSTO')).catch(error => {
      throw error;
    });
  },
});

const FormikEnhancedForm = formikEnhancer(CappedSTOFormComponent);
const ConnectedForm = connect(mapStateToProps)(FormikEnhancedForm);

export default ConnectedForm;
