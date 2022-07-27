
const Ethereum = require("./modules/pepe");
const log = require("./utils/log")
const fs = require("fs");

class Main {
  async run() {
    console.log(
      `\n 
      _____                                      _____ ____  
      / ____|                               /\   |_   _/ __ \ 
     | (___  _   _ _ __  _ __  _   _       /  \    | || |  | |
      \___ \| | | | '_ \| '_ \| | | |     / /\ \   | || |  | |
      ____) | |_| | | | | | | | |_| |    / ____ \ _| || |__| |
     |_____/ \__,_|_| |_|_| |_|\__, |   /_/    \_\_____\____/ 
                                __/ |                         
                               |___/                          
      `
      )
    //tasks = []  //imagine this is your task array from the csv 
    //for (let task in tasks) {
      //new Ethereum().run()
    //}
    let tasks = fs.readFileSync("./tasks.csv").toString().split("\n");
    for (let i in tasks) { // did it this way so you can log the task number
      let data = tasks[i];
     // console.log(data)
      log.log(`[Task: ${i}] Starting Task`)
      if (data.split(",")[0] != "ethAddy") {
        new Ethereum().run(data)
      }
    }
  }
}
new Main().run()