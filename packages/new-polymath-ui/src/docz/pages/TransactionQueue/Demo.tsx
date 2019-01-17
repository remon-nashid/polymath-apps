import React, { Fragment } from 'react';
import { types } from '@polymathnetwork/new-shared';

import { Button } from '~/components/Button';
import { ModalTransactionQueue } from '~/components/ModalTransactionQueue';
import { ModalConfirmTransactionQueue } from '~/components/ModalConfirmTransactionQueue';
import { mockTransactionQueue } from '~/components/ModalTransactionQueue/docs/Demo';

interface State {
  transactionQueue: types.TransactionQueueEntity;
  isConfirmed: boolean;
}

export class Demo extends React.Component<State> {
  state = {
    transactionQueue: null,
    isConfirmed: false,
  };

  componentDidUpdate(prevProps: any, prevState: State) {
    if (
      prevState.isConfirmed &&
      !this.state.isConfirmed &&
      this.state.transactionQueue
    ) {
      setTimeout(() => {
        this.setState({
          transactionQueue: {
            ...this.state.transactionQueue,
            status: types.TransactionQueueStatus.Running,
            transactions: [
              {
                uid: '0',
                type: 'First transaction',
                status: types.TransactionStatus.Running,
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
              {
                uid: '1',
                type: 'Second transaction',
                status: types.TransactionStatus.Idle,
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
            ],
          },
        });
      }, 1000);

      setTimeout(() => {
        this.setState({
          transactionQueue: {
            ...this.state.transactionQueue,
            transactions: [
              {
                uid: '0',
                type: 'First transaction',
                status: types.TransactionStatus.Succeeded,
                hash: '0xcEe94E5D4c424E229af969Aa1c1fD0e1a9DE9ADB',
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
              {
                uid: '1',
                type: 'Second transaction',
                status: types.TransactionStatus.Unapproved,
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
            ],
          },
        });
      }, 2000);

      setTimeout(() => {
        this.setState({
          transactionQueue: {
            ...this.state.transactionQueue,
            transactions: [
              {
                uid: '0',
                type: 'First transaction',
                status: types.TransactionStatus.Succeeded,
                hash: '0xcEe94E5D4c424E229af969Aa1c1fD0e1a9DE9ADB',
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
              {
                uid: '1',
                type: 'Second transaction',
                status: types.TransactionStatus.Running,
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
            ],
          },
        });
      }, 3000);

      setTimeout(() => {
        this.setState({
          transactionQueue: {
            ...this.state.transactionQueue,
            status: types.TransactionQueueStatus.Succeeded,
            transactions: [
              {
                uid: '0',
                type: 'First transaction',
                status: types.TransactionStatus.Succeeded,
                hash: '0xcEe94E5D4c424E229af969Aa1c1fD0e1a9DE9ADB',
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
              {
                uid: '1',
                type: 'Second transaction',
                status: types.TransactionStatus.Succeeded,
                hash: '0xcEe94E5D4c424E229af969Aa1c1fD0e1a9DE9ADB',
                transactionQueueUid: '111',
                tag: types.PolyTransactionTags.Any,
                description: 'desc',
                args: [],
              },
            ],
          },
        });
      }, 4000);
    }
  }

  public handleStart = () => {
    this.setState({
      transactionQueue: mockTransactionQueue,
    });
  };

  public handleConfirm = () => {
    this.setState({
      isConfirmed: false,
    });
  };

  public handleCancel = () => {
    this.setState({
      isConfirmed: false,
    });
  };

  public handleContinue = () => {
    this.setState({
      transactionQueue: null,
      isConfirmed: false,
    });
  };

  public render() {
    const { transactionQueue, isConfirmed } = this.state;

    return (
      <Fragment>
        <Button onClick={this.handleStart}>Start transaction</Button>

        {transactionQueue && (
          <Fragment>
            <ModalConfirmTransactionQueue
              transactionQueue={transactionQueue}
              isOpen={!!transactionQueue && !isConfirmed}
              onSubmit={this.handleConfirm}
              onClose={this.handleCancel}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export const DemoModal = () => null;
