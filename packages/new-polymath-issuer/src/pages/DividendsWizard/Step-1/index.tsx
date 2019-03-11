import React, { useState, useCallback, FC } from 'react';
import { validators, formatters } from '@polymathnetwork/new-shared';
import {
  Box,
  Button,
  Icon,
  icons,
  Heading,
  Card,
  Paragraph,
  Remark,
  ModalConfirm,
  FormItem,
  Checkbox,
  CsvUploader,
  Form,
  LinkButton,
} from '@polymathnetwork/new-ui';
import { ExclusionEntry } from '../Presenter';

export interface Step1Props {
  onNextStep: (values: Values) => void;
  excludedWallets: null | ExclusionEntry[];
  setExcludedWallets: (csv: this['excludedWallets']) => void;
  downloadSampleExclusionList: () => void;
}

interface Values {
  excludedWallets: null | ExclusionEntry[];
  noWalletExcluded: boolean;
}

export const Step1: FC<Step1Props> = ({
  onNextStep,
  excludedWallets,
  setExcludedWallets,
  downloadSampleExclusionList,
}) => {
  const [isCsvModalOpen, setCsvModalState] = useState(false);

  const handleCsvModalOpen = useCallback(() => {
    setCsvModalState(true);
  }, []);

  const handleCsvModalClose = useCallback(() => {
    setCsvModalState(false);
  }, []);

  const handleSubmit = (values: Values) => {
    // Set csv file
    setExcludedWallets(values.excludedWallets);
    onNextStep(values);
  };

  return (
    <Form<Values>
      initialValues={{
        noWalletExcluded: false,
        excludedWallets,
      }}
      onSubmit={handleSubmit}
      render={({ values, submitForm }) => (
        <Card p="gridGap" boxShadow={1}>
          <Heading variant="h2" mb="l">
            1. Exclude Wallets from the Dividends Calculation
          </Heading>
          <Paragraph>
            Optionally exclude specific investor wallet addresses from the
            dividends calculation and distribution by uploading their address
            via a CSV which includes one wallet (ETH) address per line.
          </Paragraph>
          <Paragraph>
            You can download
            <LinkButton onClick={downloadSampleExclusionList}>
              <Icon Asset={icons.SvgDownload} /> Sample-Exclusion-List.csv
            </LinkButton>{' '}
            example file and edit it.
          </Paragraph>
          <Button
            variant="ghostSecondary"
            iconPosition="right"
            onClick={handleCsvModalOpen}
          >
            Upload CSV of ETH Addresses to exclude
            <Icon
              Asset={icons.SvgDownload}
              width={18}
              height={18}
              rotate="0.5turn"
            />
          </Button>
          <ModalConfirm
            isOpen={isCsvModalOpen}
            onSubmit={submitForm}
            onClose={handleCsvModalClose}
            actionButtonText="Update list and proceed to the next step"
            isActionDisabled={!values.excludedWallets}
          >
            <ModalConfirm.Header>
              Upload CSV of ETH Addresses to exclude
            </ModalConfirm.Header>
            <Paragraph fontSize={2}>
              This is the explanation of what is going on here.
            </Paragraph>
            <FormItem name="excludedWallets">
              <FormItem.Input
                component={CsvUploader}
                inputProps={{
                  csvConfig: {
                    columns: [
                      {
                        name: 'Investor ETH Address',
                        validators: [
                          validators.isString,
                          validators.isEthereumAddress,
                          validators.isNotEmpty,
                        ],
                        required: true,
                      },
                    ],
                    header: true,
                    maxRows: 100,
                  },
                }}
              >
                <CsvUploader.CsvErrors />
                <CsvUploader.CsvPreview
                  tableConfig={{
                    columns: [
                      {
                        accessor: 'Investor ETH Address',
                        Header: 'Investor ETH Address',
                        Cell: ({ value }) =>
                          value &&
                          formatters.toShortAddress(value, { size: 26 }),
                      },
                    ],
                  }}
                />
              </FormItem.Input>
              <FormItem.Error />
            </FormItem>
          </ModalConfirm>
          <Box mt="m">
            <Remark>
              The number of tokens contained in the wallets that are excluded
              from the dividends calculation and distribution will be deducted
              from the total supply before the final percentages are calculated.
              For example, if 10 wallets each contain 1 token and 2 wallets are
              excluded from dividends, each of the remaining 8 wallets will
              receive 1/8 of the dividends
              <br />
              <strong>
                The maximum number of addresses that can be excluded is 100.
              </strong>
            </Remark>
          </Box>
          <Heading variant="h3" mt="4">
            No Dividends Exclusion Required
          </Heading>
          <FormItem name="noWalletExcluded">
            <FormItem.Input
              component={Checkbox}
              inputProps={{
                label:
                  'I confirm that no wallets must be excluded from the dividends distribution.',
              }}
            />
            <FormItem.Error />
          </FormItem>
          <Box mt="xl">
            <Button disabled={!values.noWalletExcluded} onClick={submitForm}>
              Skip the step
            </Button>
          </Box>
        </Card>
      )}
    />
  );
};
