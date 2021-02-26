import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Alert from 'components/antd/alert';
import Button from 'components/antd/button';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import RadioCard from 'modules/smart-yield/components/radio-card';
import { useTokenPool } from 'modules/smart-yield/views/token-pool-view/token-pool-provider';

const SENIOR_TRANCHE_KEY = 'senior';
const JUNIOR_TRANCHE_KEY = 'junior';

const SelectTranche: React.FC = () => {
  const history = useHistory();
  const poolCtx = useTokenPool();

  const { pool } = poolCtx;

  const [tranche, setTranche] = useState<string | undefined>();

  function handleSeniorSelect() {
    setTranche(SENIOR_TRANCHE_KEY);
  }

  function handleJuniorSelect() {
    setTranche(JUNIOR_TRANCHE_KEY);
  }

  function handleCancel() {
    history.push(`/smart-yield`);
  }

  function handleNextStep() {
    history.push(`/smart-yield/${pool?.smartYieldAddress}/deposit/${tranche}`);
  }

  return (
    <>
      <Grid flow="col" gap={32} colsTemplate="1fr 1fr" className="mb-32">
        <RadioCard selected={tranche === SENIOR_TRANCHE_KEY} onClick={handleSeniorSelect}>
          <Icon name="senior_tranche" width={64} height={64} className="mb-24" />
          <Text type="small" weight="semibold" className="mb-4">
            Senior tranche
          </Text>
          <Text type="p1" weight="semibold" color="primary" className="mb-8">
            Fixed APY
          </Text>
          <Text type="p1" weight="bold" color="green">
            - %
          </Text>
        </RadioCard>
        <RadioCard selected={tranche === JUNIOR_TRANCHE_KEY} onClick={handleJuniorSelect}>
          <Icon name="junior_tranche" width={64} height={64} className="mb-24" />
          <Text type="small" weight="semibold" className="mb-4">
            Junior tranche
          </Text>
          <Text type="p1" weight="semibold" color="primary" className="mb-8">
            Variable APY
          </Text>
          <Text type="p1" weight="bold" color="purple">
            - %
          </Text>
        </RadioCard>
      </Grid>
      {tranche && (
        <Alert
          className="mb-32"
          type="warning"
          message="Sed elementum nulla sit amet accumsan dapibus. Integer auctor et elit in lobortis. Fusce ex nulla, aliquam vitae quam quis, tincidunt ultricies purus."
        />
      )}
      <Grid flow="col" gap={64} align="center" justify="space-between">
        <Button type="light" onClick={handleCancel}>
          <Icon name="left-arrow" width={9} height={8} />
          Cancel
        </Button>
        <Button type="primary" disabled={!tranche} onClick={handleNextStep}>
          Next Step
        </Button>
      </Grid>
    </>
  );
};

export default SelectTranche;
