import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

import { toNumber } from 'utils';

const ABI: AbiItem[] = [
  createAbiItem('epoch1Start', [], ['uint256']),
  createAbiItem('epochDuration', [], ['uint256']),
  createAbiItem('getCurrentEpoch', [], ['uint128']),
  createAbiItem('getEpochPoolSize', ['address', 'uint128'], ['uint256']),
  createAbiItem('getEpochUserBalance', ['address', 'address', 'uint128'], ['uint256']),
  createAbiItem('balanceOf', ['address', 'address'], ['uint256']),
  createAbiItem('deposit', ['address', 'uint256'], []),
  createAbiItem('withdraw', ['address', 'uint256'], []),
];

export type YfStakedToken = {
  currentEpochPoolSize?: BigNumber;
  nextEpochPoolSize?: BigNumber;
  currentEpochUserBalance?: BigNumber;
  nextEpochUserBalance?: BigNumber;
};

export class YfStakingContract extends Web3Contract {
  constructor(stakingAddress: string) {
    super(ABI, stakingAddress, 'YF STAKING');

    this.stakedTokens = new Map();

    this.on(Web3Contract.UPDATE_ACCOUNT, () => {
      // reset user data
      this.stakedTokens.forEach(stakedToken => {
        stakedToken.currentEpochUserBalance = undefined;
        stakedToken.nextEpochUserBalance = undefined;
      });
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  // common data
  currentEpoch?: number;
  epochStart?: number;
  epochDuration?: number;
  stakedTokens: Map<string, YfStakedToken>;

  // computed data
  get epochDates(): [number, number, number] | undefined {
    if (!this.epochStart || !this.currentEpoch || !this.epochDuration) {
      return undefined;
    }

    const startDate = (this.epochStart + (this.currentEpoch - 1) * this.epochDuration) * 1_000;
    const endDate = (this.epochStart + this.currentEpoch * this.epochDuration) * 1_000;
    const progress = ((Date.now() - startDate) / (this.epochDuration * 1_000)) * 100;

    return [startDate, endDate, progress];
  }

  async loadCommonFor(tokenAddress: string): Promise<void> {
    const [currentEpoch, epochStart, epochDuration] = await this.batch([
      { method: 'getCurrentEpoch' },
      { method: 'epoch1Start' },
      { method: 'epochDuration' },
    ]);
    const cEpoch = (this.currentEpoch = toNumber(currentEpoch));

    this.epochStart = toNumber(epochStart);
    this.epochDuration = toNumber(epochDuration);

    if (cEpoch !== undefined) {
      const [currentEpochPoolSize, nextEpochPoolSize] = await this.batch([
        { method: 'getEpochPoolSize', methodArgs: [tokenAddress, cEpoch] },
        { method: 'getEpochPoolSize', methodArgs: [tokenAddress, cEpoch + 1] },
      ]);

      const stakedToken = {
        ...this.stakedTokens.get(tokenAddress),
        currentEpochPoolSize: new BigNumber(currentEpochPoolSize),
        nextEpochPoolSize: new BigNumber(nextEpochPoolSize),
      };
      this.stakedTokens.set(tokenAddress, stakedToken);
    }

    this.emit(Web3Contract.UPDATE_DATA);
  }

  async loadUserDataFor(tokenAddress: string): Promise<void> {
    const account = this.account;

    this.assertAccount();

    const [currentEpoch] = await this.batch([{ method: 'getCurrentEpoch' }]);
    const cEpoch = (this.currentEpoch = toNumber(currentEpoch));

    if (cEpoch !== undefined) {
      const [userBalance, currentEpochUserBalance, nextEpochUserBalance] = await this.batch([
        { method: 'balanceOf', methodArgs: [account, tokenAddress] },
        { method: 'getEpochUserBalance', methodArgs: [account, tokenAddress, cEpoch] },
        { method: 'getEpochUserBalance', methodArgs: [account, tokenAddress, cEpoch + 1] },
      ]);

      const stakedToken = {
        ...this.stakedTokens.get(tokenAddress),
        userBalance: new BigNumber(userBalance),
        currentEpochUserBalance: new BigNumber(currentEpochUserBalance),
        nextEpochUserBalance: new BigNumber(nextEpochUserBalance),
      };
      this.stakedTokens.set(tokenAddress, stakedToken);
    }

    this.emit(Web3Contract.UPDATE_DATA);
  }

  async stake(tokenAddress: string, amount: BigNumber | string, gasPrice: number): Promise<BigNumber> {
    const result = await this.send('deposit', [tokenAddress, amount], {}, gasPrice);
    return new BigNumber(result);
  }

  async unstake(tokenAddress: string, amount: BigNumber | string, gasPrice: number): Promise<BigNumber> {
    const result = await this.send('withdraw', [tokenAddress, amount], {}, gasPrice);
    return new BigNumber(result);
  }
}
