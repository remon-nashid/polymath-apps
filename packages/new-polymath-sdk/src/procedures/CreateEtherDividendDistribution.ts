import { Procedure } from './Procedure';
import { TaxWithholding, PolyTransactionTags } from '~/types';

interface Args {
  symbol: string;
  maturityDate: Date;
  expiryDate: Date;
  amount: number;
  checkpointId: number;
  name: string;
  excludedAddresses?: string[];
  taxWithholdings?: TaxWithholding[];
}

export class CreateEtherDividendDistribution extends Procedure<Args> {
  public async prepareTransactions() {
    const {
      symbol,
      maturityDate,
      expiryDate,
      amount,
      checkpointId,
      name,
      excludedAddresses,
      taxWithholdings = [],
    } = this.args;
    const { securityTokenRegistry } = this.context;

    const securityToken = await securityTokenRegistry.getSecurityToken(symbol);
    const etherModule = await securityToken.getEtherDividendModule();

    if (!etherModule) {
      throw new Error(
        "Dividend modules haven't been enabled. Did you forget to call .enableDividendModules()?"
      );
    }

    await this.addTransaction(etherModule.createDividend, {
      tag: PolyTransactionTags.CreateEtherDividendDistribution,
    })(maturityDate, expiryDate, amount, checkpointId, name, excludedAddresses);

    if (taxWithholdings.length > 0) {
      const investorAddresses: string[] = [];
      const percentages: number[] = [];

      taxWithholdings.forEach(({ address, percentage }) => {
        investorAddresses.push(address);
        percentages.push(percentage);
      });

      await this.addTransaction(etherModule.setWithholding, {
        tag: PolyTransactionTags.SetEtherTaxWithholding,
      })(investorAddresses, percentages);
    }
  }
}
