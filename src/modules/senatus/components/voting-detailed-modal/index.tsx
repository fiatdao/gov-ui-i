import React from 'react';
import BigNumber from 'bignumber.js';
import cn from 'classnames';
import { ZERO_BIG_NUMBER, formatEntrValue } from 'web3/utils';

import Modal, { ModalProps } from 'components/antd/modal';
import Icon from 'components/custom/icon';
import { useLeftTime } from 'hooks/useLeftTime';
import useMergeState from 'hooks/useMergeState';

import { useDAO } from '../dao-provider';

import { isValidAddress } from 'utils';

import s from './s.module.scss';

export type VotingDetailedModalProps = ModalProps;

type VotingDetailedModalState = {
  leftBonus?: BigNumber;
  leftTotalVotingPower?: BigNumber;
};

const InitialState: VotingDetailedModalState = {
  leftBonus: undefined,
  leftTotalVotingPower: undefined,
};

const VotingDetailedModal: React.FC<VotingDetailedModalProps> = props => {
  const daoCtx = useDAO();
  const { votingPower, userDelegatedTo, delegatedPower, userLockedUntil, balance: myEntrBalance } = daoCtx.daoComitium;

  const [state, setState] = useMergeState<VotingDetailedModalState>(InitialState);

  const isDelegated = isValidAddress(userDelegatedTo);
  const loadedUserLockedUntil = React.useMemo(() => (userLockedUntil ?? Date.now()) - Date.now(), [userLockedUntil]);

  useLeftTime({
    end: !isDelegated ? userLockedUntil ?? 0 : 0,
    delay: 1_000,
    onTick: leftTime => {
      let bonus = votingPower?.minus(delegatedPower ?? ZERO_BIG_NUMBER);

      if (!isDelegated) {
        bonus = bonus?.minus(myEntrBalance ?? ZERO_BIG_NUMBER);
      }

      const leftBonus = bonus?.multipliedBy(leftTime).div(loadedUserLockedUntil);
      const leftTotalVotingPower = votingPower?.minus(bonus ?? ZERO_BIG_NUMBER).plus(leftBonus ?? ZERO_BIG_NUMBER);

      setState({
        leftBonus,
        leftTotalVotingPower,
      });
    },
  });

  React.useEffect(() => {
    setState({
      leftBonus: isDelegated
        ? ZERO_BIG_NUMBER
        : votingPower?.minus(myEntrBalance ?? ZERO_BIG_NUMBER).minus(delegatedPower ?? ZERO_BIG_NUMBER),
      leftTotalVotingPower: votingPower,
    });
  }, [isDelegated]);

  return (
    <Modal className={s.component} title="Voting power detailed view" {...props}>
      <dl className={s.list}>
        <div className={s.row}>
          <dt className={s.term}>
            <Icon name="wallet-outlined" width={24} height={24} className={s.termIcon} />
            My staked balance
          </dt>
          <dd className={s.data}>
            {formatEntrValue(myEntrBalance)}
            <Icon name="png/circle-plus-outlined" width={16} height={16} color="green" className={s.dataIcon} />
          </dd>
        </div>
        {/*<div className={s.row}>*/}
        {/*  <dt className={s.term}>*/}
        {/*    <Icon name="wallet-outlined" width={20} height={20} className={s.termIcon} />*/}
        {/*    Delegated by me*/}
        {/*  </dt>*/}
        {/*  <dd className={s.data}>*/}
        {/*    {isDelegated ? formatEntrValue(myEntrBalance) : 0}*/}
        {/*    <Icon name="circle-minus-outlined" width={18} height={18} color="red" className={s.dataIcon} />*/}
        {/*  </dd>*/}
        {/*</div>*/}
        <div className={s.row}>
          <dt className={s.term}>
            <Icon name="rate-outlined" width={24} height={24} className={s.termIcon} />
            Locked balance bonus
          </dt>
          <dd className={s.data}>
            {state.leftBonus?.gt(ZERO_BIG_NUMBER) ? '> ' : ''}
            {formatEntrValue(state.leftBonus)}
            <Icon name="png/circle-plus-outlined" width={16} height={16} color="green" className={s.dataIcon} />
          </dd>
        </div>
        <div className={s.row}>
          <dt className={s.term}>
            <Icon name="handshake-outlined" width={24} height={24} className={s.termIcon} />
            Delegated to me
          </dt>
          <dd className={s.data}>
            {formatEntrValue(delegatedPower)}
            <Icon name="png/circle-plus-outlined" width={16} height={16} color="green" className={s.dataIcon} />
          </dd>
        </div>
        <div className={s.separator} />
        <div className={s.row}>
          <dt className={s.term}>
            <Icon name="stamp-outlined" width={24} height={24} className={s.termIcon} />
            My total voting power
          </dt>
          <dd className={cn(s.data, s.dataTotal)}>{formatEntrValue(state.leftTotalVotingPower)}</dd>
        </div>
      </dl>
    </Modal>
  );
};

export default VotingDetailedModal;
