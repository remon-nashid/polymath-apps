import { Procedure } from './Procedure';
import { PolyTransactionTags } from '~/types';

interface Args {
  symbol: string;
}

export class CreateCheckpoint extends Procedure<Args> {
  public async prepareTransactions() {
    const { symbol } = this.args;
    const { securityTokenRegistry } = this.context;

    const securityToken = await securityTokenRegistry.getSecurityToken(symbol);

    await this.addTransaction(securityToken.createCheckpoint, {
      tag: PolyTransactionTags.CreateCheckpoint,
    })();
  }
}
