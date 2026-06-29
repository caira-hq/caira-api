import { Horizon } from '@stellar/stellar-sdk';

const HORIZON_URL =
  process.env.STELLAR_NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

const stellarServer = new Horizon.Server(HORIZON_URL);

export { stellarServer, HORIZON_URL };
