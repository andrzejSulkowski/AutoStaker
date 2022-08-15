
import { api } from "./apiQuerys.js";
import { Account } from "./account.js"


let account = undefined
chrome.storage.sync.get(['account'], function(result) {
  result.account
  account = result.account
  console.log(result.account)
  displayAccount(result.account)
});


// Dynamic Fields
let htmlSelector = {
  timeToWait : document.querySelector(".estimated-countdown"),
  address: document.getElementById("address"),
  balances: {
    availableBalance : document.querySelector("#asset-available div:nth-child(2)"),
    stakedBalance : document.querySelector("#asset-staked div:nth-child(2)"),
    pendingRewardBalance : document.querySelector("#asset-pending-reward div:nth-child(2)")
  },
  buttons: {
    watchAddressBtn : document.getElementById("watch-address-btn"),
    claimBtn : document.getElementById("claim-btn"),
    stakeBtn : document.getElementById("stake-btn")
  }
}

let fee = {
  low: 0.001952 * Math.pow(10,6),
  average: 0.004879 * Math.pow(10, 6),
  high: 0.007806 * Math.pow(10.6)
}

function initEventListener(){
  htmlSelector.buttons.watchAddressBtn.addEventListener("click", async() => {
    if(htmlSelector.address.value.length !== 45){
      throw new Error("invalid address")
    }

    let account = new Account(htmlSelector.address.value, api)
    account.build()
      .then(() => {
        console.log("account build")
        setStoredAccount(account)

        htmlSelector.balances.availableBalance.innerHTML = coinConverter(account.available, 4) + " ATOM"
        htmlSelector.balances.stakedBalance.innerHTML = coinConverter(account.staked, 4) + " ATOM"
        htmlSelector.balances.pendingRewardBalance.innerHTML = coinConverter(account.pendingStakingReward, 4) + " ATOM"
      
        getApr(account.validators[0])
          .then((apr) => {

            let hoursObject = getMaxCapital(account.staked, fee.low, parseFloat(apr))
            let hoursInTokens = account.staked * hoursObject.interval * parseFloat(apr) / (365*24)

            if(hoursInTokens >= account.pendingStakingReward){
              // Wait
              let tokenDiff = hoursInTokens - account.pendingStakingReward
              let hoursDiff = tokenDiff / ((parseFloat (apr) * account.staked) / (365 * 24))
              console.log("Real Hours Difference: " + hoursDiff)
              startTime(new Date().getTime() + hoursDiff*60*60*1000)

            }else{
              // Claim
              stopTimer(timingInterval)
              displayClaimAndStake()
            }
            
            
  
          })
      })



  
  })
  
  htmlSelector.buttons.claimBtn.addEventListener("click", async() => {
    /*
    await getCurrentTab()
      .then((currentTab) => {
        if(currentTab.title !== "Auto Staker"){
          chrome.tabs.create({
            url: 'AutoStaker.html'
          });
        }
      })
  
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        "claim": true,
        "amount": 1000
      });
    });
    });
    */
  
  })
}
initEventListener()


function displayClaimAndStake(){
  htmlSelector.timeToWait.innerHTML = "Claim & Stake!"
  htmlSelector.timeToWait.parentElement.classList.remove('collapsed')
}

function displayBalances(account){
  htmlSelector.balances.availableBalance.innerHTML = coinConverter(account.available, 4) + " ATOM"
  htmlSelector.balances.stakedBalance.innerHTML = coinConverter(account.staked, 4) + " ATOM"
  htmlSelector.balances.pendingRewardBalance.innerHTML = coinConverter(account.pendingStakingReward, 4) + " ATOM"
}

async function getApr(validatorAddress) {
  return Promise.all([
    api.global.getInflation(),
    api.global.getBondedTokenRatio(),
    api.staking.getValidatorInfo(validatorAddress)
  ]).then((data) => {
    let inflation = parseFloat( data[0].inflation )
    let bondedTokensRatio = parseFloat( data[1].params.goal_bonded )
    let communityTax = parseFloat( data[2].result.commission.commission_rates.rate )

    return (inflation * (1 - communityTax)) / bondedTokensRatio
  })
}
function displayAccount(account){
  displayBalances(account)
  htmlSelector.address.innerHTML = account.address
}
function displayCountdown(days, hours, minutes, seconds){
  htmlSelector.timeToWait.parentElement.classList.remove('collapsed')
  htmlSelector.timeToWait.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`
}
function initCountdown(hours){
  
  var countDownDate = new Date().getTime() + (hours * 60 * 60 * 1000)

  setInterval(function(){
    var now = new Date().getTime()
    var distance = countDownDate - now
    
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    displayCountdown(days,hours,minutes,seconds)
    
  }, 1000)

  

}

// OPTIMAL INTERVAL
function getMaxCapital(stake, fee, apy){
  let globalMax = {
      interval: 0,
      stake: 0
  }

  for (let n = 1; n <= 365*24; n++) {
      let newStake = simulateCompound(stake, fee, apy, n)
      if(newStake > globalMax.stake){
          globalMax.interval = n
          globalMax.stake = newStake
      }
  }
  return globalMax
}

function simulateCompound(stake, fee, apy, n){
  let reward
  let lastClaimAtHour
  for (let hours = 0; hours <= 365*24; hours++) {

      if(hours % n === 0 && hours !== 0){

          reward = claim(stake, fee, apy, n)
          stake = stake + (reward - fee)
          lastClaimAtHour = hours
      }   
  }
  let pendingFunds = stake * (apy*(365*24-lastClaimAtHour)/365/24)
  return Math.floor(stake + pendingFunds)
}

function claim(stake, fee, apy, n){
return stake * (apy*n/365/24) - fee
}








// API CALLS
async function getAvailableBalance(address, denom){
  return await api.bank.getBalance(address, denom)
}
async function getPendingRewardBalance(address, denom){
  return await api.staking.getAllPendingStakingRewards(address)
    .then((data) => {
      for (const totalBalance of data.total) {
        if(totalBalance.denom === denom){
          return totalBalance.amount
        }
      }
      return 0
    })
}
async function getStakedBalance(address, denom){
  return await api.staking.getAllDelegations(address)
    .then((delegations) => {
      for (const delegation of delegations) {
        if(delegation.balance.denom === denom){
          return delegation.balance.amount
        }
      }
      return 0
    })
}



// helper functions
function coinConverter(x, decimals){
  return (x / Math.pow(10,6)).toFixed(decimals)
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}




function setStoredAccount(account){
  chrome.storage.sync.set({account: account}, function() {
    console.log('Account is set to ' + account);
  });
}

chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
  if (response.time) {
    const time = new Date(response.time);
    startTimer(time)
  }
});


let timingInterval = undefined

function myTimer(deadline){

  var distance = deadline - new Date().getTime()
  if(distance < 0){
    stopTimer(timingInterval)
  }
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  displayCountdown(days,hours,minutes,seconds)
}

function startTimer(time) {

  var distance = time - new Date().getTime()
  console.log(distance)
  stopTimer(timingInterval)
  if (distance > 0) {
    timingInterval = setInterval(myTimer, 1000, time)
  }else{
    chrome.runtime.sendMessage({ cmd: 'TIME_IS_UP' });
  }
}
function stopTimer(interval){
  clearInterval(interval)
}

function startTime(time) {
  chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: time });
  startTimer(time);
}

