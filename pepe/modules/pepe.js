const rpc = "https://eth-mainnet.g.alchemy.com/v2/Fsh2rJdqJRTIxa72ICEt5oelIjZZCTOY"
var deekayDropId;
var twitterUserName;
var ethAddy;
var btcAddy;
var privKey = ``;
var maxFee = ``;
var maxPrioFee = ``;
const priceCheckMin = 0.1;
const priceCheckMax = 0.3;
const dropId = "147"

const headers = {
  "accept": "/",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "sec-ch-ua": `".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"`,
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": `"macOS"`,
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "dnt": "1"
}
let cost
const Web3 = require("web3");
const web3 = new Web3(rpc);
const log = require("../utils/log")
const sleep = require("../utils/sleep")
const { ethers } = require("ethers");
require("log-timestamp");
const axios = require("axios").default;
const { RecaptchaV3Task } = require("node-capmonster")

let buyData;
let id;


class Ethereum {
  async run(data) {
    log.log("Starting Eth Task...")
    ethAddy = data.split(",")[0]; 
    privKey = data.split(",")[1];
    btcAddy = data.split(",")[2];
    twitterUserName = data.split(",")[3]; 
    deekayDropId = data.split(",")[4];
    maxFee = data.split(",")[5];
    maxPrioFee = data.split(",")[6];
    while (1) {
      const sendToAddy = await this.buy()
      if(sendToAddy) {
        await this.sendEthereum(sendToAddy)
        await sleep.sleep(1000)
        await this.checkOrder()
        break;
      } else {
        log.log("drop not live")
      }
    }
  }
  
  async sendEthereum(input) {
    try {
      log.log("working")

      let ethSendAddy = input;
  
      console.log(ethSendAddy)
      const transaction = await web3.eth.accounts.signTransaction(
        {
          to: ethSendAddy,
          value: ethers.utils.parseEther(cost),
          data: "0x",
          maxFeePerGas: ethers.utils.parseUnits(maxFee, "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits(maxPrioFee, "gwei"),
          gas: 21000,
        },
        privKey
      );
      console.log("Sending Tx now");
      //web3.eth.sendSignedTransaction(transaction.rawTransaction).on("receipt", console.log);
    } catch (error) {
      console.log(error);
    }
  }
  async buy() {
    try {
      buyData = {
        name: twitterUserName,
        quantity: "1",
        addressDelivery: btcAddy,
        addressPayment: ethAddy,
        token: await this.captchaSolver()
      };
      console.log(buyData)
      const url = `https://pepe.wtf/api/drop/${dropId}/buyer`;
      const response = await axios.post(url, buyData, headers);
      const ethSendAddy = response.data.drop.dropEthAddr;
      const qty = response.data.drop.quantity;
      console.log(response.data)      
      const ethPrice = response.data["dropprice"]["value"];
      cost = ethPrice
      console.log(ethPrice, ethSendAddy, qty);
      if (priceCheckMin < ethPrice && ethPrice < priceCheckMax) {
        console.log("live!")
        id = response.data.id;
        return ethSendAddy;
      } else {
          console.log("eth no match price, use different mode")
          process.exit(1);
      }
      
    } catch (error) {
      console.log(error.response.data)
    }
  }
  async checkOrder() {
    while (1) {
      let response = await axios.get(`https://pepe.wtf/api/drop/${dropId}/buyer${id}`);
      console.log(response.data)
      await sleep.sleep(1000);
    }
  }

  async captchaSolver() {
    const capmonster = new RecaptchaV3Task("84e4215329925efdbe02e605ee501ac4")
    let init = await capmonster.createTask("https://pepe.wtf/drops", "6Le8EhshAAAAADOhSH3rjXG5v6uYTakI1IQSaSuc");
    let response = await capmonster.joinTaskResult(init);
    return response.gRecaptchaResponse; // test this!!!
  }
}
module.exports = Ethereum