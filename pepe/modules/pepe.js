const rpc = "get ur own"
var twitterUserName;
var ethAddy;
var btcAddy;
var privKey = ``;
var maxFee = ``;
var maxPrioFee = ``;
const priceCheckMin = 0.0001;
const priceCheckMax = 0.01;
var dropId;
const Captcha = require("2captcha")
const CryptoJS = require("crypto-js");

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

let buyData;
let id;


class Ethereum {
  async run(data) {
    log.log("Starting Pepe Task...")
    ethAddy = data.split(",")[0]; 
    privKey = data.split(",")[1];
    btcAddy = data.split(",")[2];
    twitterUserName = data.split(",")[3]; 
    dropId = data.split(",")[4];
    maxFee = data.split(",")[5];
    maxPrioFee = data.split(",")[6];
    while (1) {
      const sendToAddy = await this.buy()
      if(sendToAddy) {
        await this.sendEthereum(sendToAddy)
        await sleep.sleep(4000)
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
          value: ethers.utils.parseEther(cost.toString()),
          data: "0x",
          maxFeePerGas: ethers.utils.parseUnits(maxFee, "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits(maxPrioFee, "gwei"),
          gas: 21000,
        },
        privKey
      );
      console.log("Sending Tx now");
      web3.eth.sendSignedTransaction(transaction.rawTransaction).on("receipt", console.log);
    } catch (error) {
      console.log(error);
    }
  }
  async buy() {
    try {
      const v3Token = await this.captchaSolver()
      buyData = {
        name: twitterUserName,
        quantity: "1",
        addressDelivery: btcAddy,
        addressPayment: ethAddy,
        token: v3Token
      };
      console.log(buyData)
      const url = `https://pepe.wtf/api/drop/${dropId}/buyer/`;
      const response = await axios({
        method: 'POST',
        url,
        headers: { 
          'accept': '*/*', 
          'accept-language': 'en-US,en;q=0.9', 
          'cache-control': 'no-cache', 
          'content-type': 'application/json', 
          'origin': 'https://pepe.wtf', 
          'pragma': 'no-cache', 
          'referer': 'https://pepe.wtf/drops', 
          'sec-fetch-dest': 'empty', 
          'sec-fetch-mode': 'cors', 
          'sec-fetch-site': 'same-origin', 
          'sec-gpc': '1', 
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36'
        },
        data: buyData
      })
      console.log(response.data.status)
      let ethSendAddy = response.data.drop.dropEthAddr;
      const qty = response.data.drop.quantity;
           
      const ethPrice = response.data["dropprice"]["value"];
      cost = ethPrice
      const decryptedEthaddr = CryptoJS.AES.decrypt(ethSendAddy, v3Token).toString(CryptoJS.enc.Utf8)
      console.log(ethPrice, decryptedEthaddr, qty);
      if (priceCheckMin < ethPrice && ethPrice < priceCheckMax) {
        console.log("live!")
        id = response.data.id;
        console.log(id)
        return decryptedEthaddr;
      } else {
          console.log("eth no match price, use different mode")
          process.exit(1);
      }
      
    } catch (error) {
      console.log(error)
    }
  }
  async checkOrder() {
    while (1) {
      let response = await axios.get(`https://pepe.wtf/api/drop/${dropId}/buyer/${id}`);
      console.log(`status: ${response.data.status}`)
      await sleep.sleep(1000);
    }
  }

  async captchaSolver() {
    const solver = new Captcha.Solver("get ur own")

    const captchaResponse = await solver.recaptcha("6Le8EhshAAAAADOhSH3rjXG5v6uYTakI1IQSaSuc", "https://pepe.wtf/", {
      version: "v2",
      action: "RecaptchaV2TaskProxyless"
    })
    return captchaResponse.data
  }
}
module.exports = Ethereum
