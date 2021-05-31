<template>
  <div class="hello">
    <h1>Moon Lottery</h1>
    <button v-if="!account" @click="connectMetamask">Connect to MetaMask</button>
    <p v-else>Logged in with account {{ account }}</p>
    <div class="lottery-form">
      <input v-model="guess" type="number" min="1" max="5" step="1" placeholder="Guess the number between 1 and 5" />
      <button @click="submit" :disabled="!guess || !account">Play!</button>
    </div>
    <div v-if="isOwner">
      <button @click="getNumber" :disabled="!account">Get answer</button>
      <div>
        <input type="text" v-model="ticketValue" />
        <button @click="setTicketValue">Set ticket value</button>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3';
import LotteryAbi from '../assets/lottery_abi.json';

export default {
  data() {
    return {
      account: '',
      owner: '',
      guess: undefined,
      web3: new Web3(window.ethereum),
      contract: undefined,
      ticketValue: 1000000000000000,
    }
  },
  props: {
    msg: String
  },
  mounted() {
    this.listenForAccount();
    this.connectToContract();
  },
  computed: {
    isOwner() {
      return this.account.trim().toLowerCase() == this.owner.trim().toLowerCase();
    }
  },
  methods: {
    connectMetamask: async function() {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
      }
    },
    listenForAccount: function() {
      if (window.ethereum) {
        let intervalCount = 0;
        const interval = setInterval(() => {
          if (window.ethereum.address || intervalCount >= 5) {
            this.account = window.ethereum.selectedAddress;
            clearInterval(interval);
          } else {
            intervalCount++;
          }
        }, 500)
        window.ethereum.on('accountsChanged', function(newAccounts) {
          this.account = newAccounts[0];
          this.checkRights();
        });
      }
    },
    connectToContract: function() {
      this.contract = new this.web3.eth.Contract(LotteryAbi, process.env.VUE_APP_CONTRACT_ADDRESS);
      this.checkRights()
    },
    async submit() {
      if (this.guess) {
        const result = await this.contract.methods.guessNumber(parseInt(this.guess)).send({ from: this.account, value: 1000000000000000, gas: 1000000 });
        if (result.status) {
          alert('You won! You will receive your funds shortly at the address: ' + this.account);
        } else {
          alert('You lost. Better luck next time!');
        }
      }
    },
    async getNumber() {
      const result = await this.contract.methods.getNumber().call({ from: this.account });
      console.log(result);
    },
    async checkRights() {
      if (this.contract) {
        this.owner = await this.contract.methods.owner().call({ from: this.account });
      }
    },
    setTicketValue() {
      return this.contract.methods.setTicketValue(parseInt(this.ticketValue)).send({ from: this.account });
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.lottery-form > input {
  width: 100px;
  margin-right: 10px;
}
</style>
