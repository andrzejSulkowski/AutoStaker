
/*

function APR(inflation, communityTax, bondedTokensRatio) {
    return (inflation * (1 - communityTax)) / bondedTokensRatio
}
inflation = 0.126349917804114645 // https://api.cosmos.network/cosmos/mint/v1beta1/inflation
communityTax = 0 // https://api.cosmos.network/staking/validators/{address}
bondedTokensRatio = 0.670000000000000000 // https://api.cosmos.network/cosmos/mint/v1beta1/params
let apr = APR(inflation, communityTax, bondedTokensRatio)

console.log(apr)


"not_bonded_tokens": "2179291581978",
"bonded_tokens": "199602826448581"
                38498735811762

inflation: 0.126349917804114645 https://api.cosmos.network/cosmos/mint/v1beta1/inflation

total supply: 304834775000313 https://api.cosmos.network/cosmos/bank/v1beta1/supply/{denom}
*/


/*
******

Provalidator: 
Address:            cosmos1g48268mu5vfp4wk7dk89r0wdrakm9p5xnm5pr9
Validator Address:  cosmosvaloper1g48268mu5vfp4wk7dk89r0wdrakm9p5xk0q50k

******
*/

var y = simulateCompound(10000,0.02, 0.2, 2)
var x = getMaxCapital(203353498, 0.004879 * Math.pow(10, 6), 0.188830)
console.log(x)
function getMaxCapital(stake, fee, apy){
    let globalMax = {
        interval: 0,
        value: 0
    }
  
    for (let n = 1; n <= 365*24; n++) {
        let newStake = simulateCompound(stake, fee, apy, n)
        if(newStake > globalMax.value){
            globalMax.interval = n
            globalMax.value = newStake
        }
    }
    return globalMax
  }

  function simulateCompound(stake, fee, apy, n){
    let reward
    for (let hours = 0; hours <= 365*24; hours++) {
  
        if(hours % n === 0 && hours !== 0){
            reward = claim(stake, fee, apy, n)
            stake += (reward - fee)
        }
    }
    return stake
}

function claim(stake, fee, apy, n){
return stake * (apy*n/365/24) - fee
}