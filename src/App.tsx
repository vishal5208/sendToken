import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, Typography, Grid, Box, IconButton, Button, CircularProgress , TextField} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function App() {
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [error, setError] = useState(null);

  // Function to connect the wallet
  const connectWallet = async () => {
    try {
      const ethereumProvider = window.ethereum;
      if (ethereumProvider) {
        await ethereumProvider.request({ method: 'eth_requestAccounts' });
        const connectedProvider = new ethers.providers.Web3Provider(ethereumProvider);
        setProvider(connectedProvider);
        const signer = connectedProvider.getSigner();
        const connectedAddress = await signer.getAddress();
        setSenderAddress(connectedAddress);
      } else {
        throw new Error('No wallet detected');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Function to send tokens
  const sendTokens = async () => {
    try {
      if (!provider) {
        throw new Error('Wallet not connected');
      }

      setTransactionStatus('Pending');
      const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider.getSigner());
      const tx = await tokenContract.transfer(recipientAddress, ethers.utils.parseUnits(tokenAmount, 'ether'));
      setTransactionHash(tx.hash);

      await tx.wait();
      setTransactionStatus('Confirmed');
    } catch (error) {
      console.error('Error sending tokens:', error);
      setError(error.message);
      setTransactionStatus('Error');
    }
  };

  // Function to detect wallet change
  const detectWalletChange = () => {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        setSenderAddress(accounts[0]);
      } else {
        setSenderAddress('');
        setProvider(null);
      }
    });
  };

  // Function to detect network change
  const detectNetworkChange = () => {
    window.ethereum.on('networkChanged', (networkId) => {
      // Handle network change
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      detectWalletChange();
      detectNetworkChange();
    }
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h3">Send ERC20 Tokens</Typography>
        <Grid container justifyContent="flex-end" alignItems="center">
          {provider ? (
            <Box mr={2} display="flex" alignItems="center">
              <Typography variant="body1">{`${senderAddress.substring(0, 6)}...${senderAddress.substring(senderAddress.length - 4)}`}</Typography>
              <IconButton color="inherit" edge="end">
                <AccountCircleIcon />
              </IconButton>
            </Box>
          ) : (
            <Button color="inherit" onClick={connectWallet}>Connect Wallet</Button>
          )}
        </Grid>
      </Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <TextField
            label="Sender Address"
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Token Amount"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Contract Address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={sendTokens} disabled={!provider}>
            Send Tokens
          </Button>
        </Grid>
        <Grid item xs={12}>
          {transactionStatus === 'Pending' && (
            <Box display="flex" alignItems="center">
              <CircularProgress size={24} />
              <Typography variant="body1" ml={1}>Transaction Pending...</Typography>
            </Box>
          )}
          {transactionStatus === 'Confirmed' && <Typography variant="body1">Transaction Confirmed!</Typography>}
          {error && <Typography variant="body1" color="error">{error}</Typography>}
        </Grid>
        {transactionHash && (
          <Grid item xs={12}>
            <Typography>Transaction Hash: {transactionHash}</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default App;
