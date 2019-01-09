import _ from 'lodash';
import { PostTransactionResolver } from '~/PostTransactionResolver';
import { TransactionSpec } from '~/types';
import { types } from '@polymathnetwork/new-shared';

function isPostTransactionResolver(
  val: any
): val is PostTransactionResolver<any> {
  return val instanceof PostTransactionResolver;
}

// TODO @RafaelVidaurre: Fix typing
// TODO @RafaelVidaurre: Add support for arrays
// TODO @RafaelVidaurre: Cleanup code
const mapValuesDeep = (
  obj: { [key: string]: any },
  fn: (...args: any[]) => any
): { [key: string]: any } =>
  _.mapValues(obj, (val, key) =>
    _.isPlainObject(val) ? mapValuesDeep(val, fn) : fn(val, key, obj)
  );

export class PolyTransaction {
  public readonly status: types.TransactionStatus =
    types.TransactionStatus.Idle;
  protected transaction: TransactionSpec<any>;
  private promise: Promise<any>;

  constructor(transaction: TransactionSpec<any>) {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });

    this.transaction = transaction;
  }

  public then(resolve: () => any, reject: () => any) {
    return this.promise.then(resolve, reject);
  }

  public async run() {
    const unwrappedArgs = this.unwrapArgs(this.transaction.args);

    try {
      await this.transaction.method(...unwrappedArgs);
    } catch (err) {
      if (err.message.indexOf('User denied transaction signature') > -1) {
        if (this.reject) {
          this.reject('Transaction was rejected by the user');
        }
      }
    }

    await this.transaction.postTransactionResolver.run();
    this.resolve();
  }

  protected resolve: (val?: any) => void = () => {};
  protected reject: (reason?: any) => void = () => {};

  private unwrapArg(arg: PostTransactionResolver<any>) {
    if (isPostTransactionResolver(arg)) {
      return arg.result;
    }
    return arg;
  }

  /**
   * Picks all post-transaction resolvers and unwraps their values
   */
  private unwrapArgs(args: any[]) {
    return _.map(args, arg => {
      return _.isPlainObject(arg)
        ? mapValuesDeep(arg as { [key: string]: any }, (val: any) => {
            return this.unwrapArg(val);
          })
        : this.unwrapArg(arg);
    });
  }
}
