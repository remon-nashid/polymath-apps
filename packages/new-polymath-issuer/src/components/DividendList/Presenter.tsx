import React, { Fragment, FC, useContext } from 'react';
import {
  List,
  ButtonLink,
  Button,
  icons,
  IconOutlined,
  TooltipPrimary,
} from '@polymathnetwork/new-ui';
import { types } from '@polymathnetwork/new-shared';
import { DividendCard } from '~/components/DividendCard';
import * as sc from './styles';
import { DIVIDEND_PAYMENT_INVESTOR_BATCH_SIZE } from '~/constants';

import { FilterCtx } from '~/pages/SecurityTokensDividends/Presenter';

export interface Props {
  dividends: types.DividendEntity[];
  securityTokenSymbol: string;
  // filterDividends: string;
  checkpointIndex: number;
  allDividendsCompleted: boolean;
}

export const DividendListPresenter: FC<Props> = ({
  securityTokenSymbol,
  dividends,
  checkpointIndex,
  // filterDividends,
  allDividendsCompleted,
}) => {
  const newDividendUrl = !allDividendsCompleted
    ? '#'
    : `/securityTokens/${securityTokenSymbol}/checkpoints/${checkpointIndex}/dividends/new`;

  // filterDividends = 'Some';
  // console.log(filterDividends);

  const [search, setSearchName] = useContext(FilterCtx);
  console.log(search);

  const searchText = search !== null ? search : '';

  return (
    <List>
      {dividends.length ? (
        <Fragment>
          {dividends
            .filter(dividend => dividend.name.toLowerCase().includes(search))
            .map(dividend => (
              <li key={dividend.uid}>
                <DividendCard
                  dividend={dividend}
                  securityTokenSymbol={securityTokenSymbol}
                />
              </li>
            ))}
          <sc.NewDividendButton
            as={allDividendsCompleted ? ButtonLink : Button}
            disabled={!allDividendsCompleted}
            href={newDividendUrl}
            variant="ghost"
            iconPosition="top"
          >
            <IconOutlined
              Asset={icons.SvgPlus}
              width={25}
              height={25}
              scale={0.8}
            />
            Add new <br /> dividend <br /> distribution
            {!allDividendsCompleted && (
              <TooltipPrimary placement="top-start">
                You can add a new dividend distribution if the previous
                distribution has been completed/expired.
              </TooltipPrimary>
            )}
          </sc.NewDividendButton>
        </Fragment>
      ) : (
        <sc.PlaceholderButton
          href={newDividendUrl}
          variant="ghost"
          iconPosition="top"
        >
          <IconOutlined
            Asset={icons.SvgPlus}
            width={25}
            height={25}
            scale={0.8}
          />
          Add new <br /> dividend <br /> distribution
        </sc.PlaceholderButton>
      )}
    </List>
  );
};
