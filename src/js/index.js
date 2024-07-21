import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './../css/index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastWinner: 0,
      numberOfBets: 0,
      minimumBet: 0,
      totalBet: 0,
      maxAmountOfBets: 0,
      provider: null,
      web3: null,
      ContractInstance: null
    };

    this.initializeWeb3 = this.initializeWeb3.bind(this);
    this.updateState = this.updateState.bind(this);
    this.setupListeners = this.setupListeners.bind(this);
    this.voteNumber = this.voteNumber.bind(this);
  }

  async componentDidMount() {
    await this.initializeWeb3();
    this.updateState();
    this.setupListeners();
    this.intervalId = setInterval(this.updateState, 7000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  async initializeWeb3() {
    // Detect MetaMask provider
    const provider = await detectEthereumProvider();

    if (provider) {
      console.log('MetaMask is installed!');
      // Initialize Web3 with the provider
      const web3 = new Web3(provider);
      this.setState({ provider, web3 });

      // Request account access
      try {
        await provider.request({ method: 'eth_requestAccounts' });
        console.log('Accounts connected');
      } catch (error) {
        console.error('User denied account access:', error);
      }

      // Define the contract ABI and address
      const MyContractABI = [
         {
            "constant": false,
            "inputs": [
               {
                  "name": "numberSelected",
                  "type": "uint256"
               }
            ],
            "name": "bet",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
         },
         {
            "constant": false,
            "inputs": [
               {
                  "name": "numberWinner",
                  "type": "uint256"
               }
            ],
            "name": "distributePrizes",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
         },
         {
            "constant": false,
            "inputs": [],
            "name": "generateNumberWinner",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
         },
         {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
         },
         {
            "inputs": [
               {
                  "name": "_minimumBet",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
         },
         {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
         },
         {
            "constant": true,
            "inputs": [
               {
                  "name": "player",
                  "type": "address"
               }
            ],
            "name": "checkPlayerExists",
            "outputs": [
               {
                  "name": "",
                  "type": "bool"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [],
            "name": "maxAmountOfBets",
            "outputs": [
               {
                  "name": "",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [],
            "name": "minimumBet",
            "outputs": [
               {
                  "name": "",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [],
            "name": "numberOfBets",
            "outputs": [
               {
                  "name": "",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
               {
                  "name": "",
                  "type": "address"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [
               {
                  "name": "",
                  "type": "address"
               }
            ],
            "name": "playerInfo",
            "outputs": [
               {
                  "name": "amountBet",
                  "type": "uint256"
               },
               {
                  "name": "numberSelected",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [
               {
                  "name": "",
                  "type": "uint256"
               }
            ],
            "name": "players",
            "outputs": [
               {
                  "name": "",
                  "type": "address"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         },
         {
            "constant": true,
            "inputs": [],
            "name": "totalBet",
            "outputs": [
               {
                  "name": "",
                  "type": "uint256"
               }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
         }
      ];
      const MyContractAddress = '0x00BA91E263200229397373183E6E46E25215394C';
      const ContractInstance = new web3.eth.Contract(MyContractABI, MyContractAddress);
      this.setState({ ContractInstance });
    } else {
      console.error('MetaMask is not installed');
    }
  }

  updateState() {
    const { ContractInstance, web3 } = this.state;

    if (ContractInstance && web3) {
      ContractInstance.methods.minimumBet().call()
        .then((result) => {
          if (result) {
            this.setState({
              minimumBet: parseFloat(web3.utils.fromWei(result, 'ether')),
            });
          }
        })
        .catch(console.error);

      ContractInstance.methods.totalBet().call()
        .then((result) => {
          if (result) {
            this.setState({
              totalBet: parseFloat(web3.utils.fromWei(result, 'ether')),
            });
          }
        })
        .catch(console.error);

      ContractInstance.methods.numberOfBets().call()
        .then((result) => {
          if (result) {
            this.setState({
              numberOfBets: parseInt(result),
            });
          }
        })
        .catch(console.error);

      ContractInstance.methods.maxAmountOfBets().call()
        .then((result) => {
          if (result) {
            this.setState({
              maxAmountOfBets: parseInt(result),
            });
          }
        })
        .catch(console.error);
    }
  }

  setupListeners() {
    let liNodes = this.refs.numbers.querySelectorAll('li');
    liNodes.forEach((number) => {
      number.addEventListener('click', (event) => {
        event.target.className = 'number-selected';
        this.voteNumber(parseInt(event.target.innerHTML), () => {
          liNodes.forEach((node) => {
            node.className = '';
          });
        });
      });
    });
  }

  async voteNumber(number, cb) {
    const { ContractInstance, web3, provider } = this.state;
    let bet = this.refs['ether-bet'].value;

    if (!bet) bet = 0.1;

    if (parseFloat(bet) < this.state.minimumBet) {
      alert('You must bet more than the minimum');
      cb();
    } else {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const fromAddress = accounts[0];
        if (!web3.utils.isAddress(fromAddress)) {
          alert('Invalid address');
          cb();
          return;
        }

        console.log('Sending transaction from address:', fromAddress);

        await ContractInstance.methods.bet(number).send({
          from: fromAddress,
          value: web3.utils.toWei(bet, 'ether'),
          gas: 300000,
        });

        cb();
      } catch (error) {
        console.error('Transaction failed:', error);
        cb();
      }
    }
  }

  render() {
    return (
      <div className="main-container">
        <h1>Bet for your best number and win huge amounts of Ether</h1>

        <div className="block">
          <b>Number of bets:</b> &nbsp;
          <span>{this.state.numberOfBets}</span>
        </div>

        <div className="block">
          <b>Last number winner:</b> &nbsp;
          <span>{this.state.lastWinner}</span>
        </div>

        <div className="block">
          <b>Total ether bet:</b> &nbsp;
          <span>{this.state.totalBet} ether</span>
        </div>

        <div className="block">
          <b>Minimum bet:</b> &nbsp;
          <span>{this.state.minimumBet} ether</span>
        </div>

        <div className="block">
          <b>Max amount of bets:</b> &nbsp;
          <span>{this.state.maxAmountOfBets}</span>
        </div>

        <hr />

        <h2>Vote for the next number</h2>

        <label>
          <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
          <br />
        </label>

        <ul ref="numbers">
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
          <li>6</li>
          <li>7</li>
          <li>8</li>
          <li>9</li>
          <li>10</li>
        </ul>

        <hr />

        <div><i>Only working with the Ropsten Test Network</i></div>
        <div><i>You can only vote once per account</i></div>
        <div><i>Your vote will be reflected when the next block is mined</i></div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
