import React from 'react';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Grid from 'components/custom/grid';
import { IconWallet } from 'components/custom/icon-wallet';
import { Text } from 'components/custom/typography';
import useMergeState from 'hooks/useMergeState';
import LedgerDerivationPathModal from 'wallets/components/ledger-deriviation-path-modal';
import { WalletConnectors, useWallet } from 'wallets/wallet';

import s from './s.module.scss';

import { WalletConnector } from 'wallets/types';

export type ConnectWalletModalProps = ModalProps;

type ConnectWalletModalState = {
  showLedgerModal: boolean;
};

const InitialState: ConnectWalletModalState = {
  showLedgerModal: false,
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = props => {
  const { ...modalProps } = props;

  const wallet = useWallet();
  const [state, setState] = useMergeState<ConnectWalletModalState>(InitialState);

  function handleConnectorSelect(connector: WalletConnector) {
    if (wallet.isActive) {
      return;
    }

    if (connector.id === 'ledger') {
      setState({
        showLedgerModal: true,
      });
      return;
    }

    wallet.connect(connector).catch(Error);
  }

  return (
    <Modal width={568} {...modalProps}>
      <Grid flow="row" gap={32}>
        <Grid flow="row" gap={4}>
          <Text type="h2" weight="bold" color="primary">
            Connect Wallet
          </Text>
          <Text type="p1" color="secondary">
            Please select the wallet of your liking
          </Text>
        </Grid>

        <Grid gap={24} colsTemplate="repeat(auto-fit, minmax(120px, 240px))">
          {WalletConnectors.map(connector => (
            <Button
              key={connector.id}
              type="select"
              className={s.button}
              style={{ height: '96px' }}
              onClick={() => handleConnectorSelect(connector)}>
              <IconWallet wallet={connector.id} style={{ height: 32 }} />
            </Button>
          ))}
        </Grid>
      </Grid>

      {state.showLedgerModal && (
        <LedgerDerivationPathModal
          onCancel={() => {
            setState({ showLedgerModal: false });
          }}
        />
      )}
    </Modal>
  );
};

export default ConnectWalletModal;
