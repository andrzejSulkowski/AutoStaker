/*

https://v1.cosmos.network/rpc/v0.45.1
Cosmos SDK v0.45.1 (Gaia v7.0.0 / cosmoshub-4)
cosmosvaloper1r2dthxctqzhwg299e7aaeqwfkgcc9hg8k3yd7m
*/

var api = {
    staking: {
        getAllPendingStakingRewards: async function(address){
            return fetch(`https://api.cosmos.network/cosmos/distribution/v1beta1/delegators/${address}/rewards`)
                .then((response) => response.json())
                .then((data) => {return data})
                .catch((e) => console.error(e))
        },
        getAllDelegations: async function(address){
            return fetch(`https://api.cosmos.network/cosmos/staking/v1beta1/delegations/${address}`)
                .then((response) => response.json())
                .then((data) => {return data.delegation_responses})
                .catch((e) => console.error(e))
        },
        getAllUsingValidators: async function(address){
            return fetch(`https://api.cosmos.network/cosmos/distribution/v1beta1/delegators/${address}/validators`)
                .then((response) => response.json())
                .then((data) => {return data})
                .catch((e) => console.error(e))
        },
        getValidatorInfo: async function(address){ 
            return fetch(`https://api.cosmos.network/staking/validators/${address}`) //old API
                .then((response) => response.json())
                .then((data) => {return data})
                .catch((e) => console.error(e))
        }
    },
    bank: {
        getAllBalances: async function(address){
            return fetch(`https://api.cosmos.network/bank/balances/${address}`)
            .then((response) => response.json())
            .then((data) => {
                return data.result
            })
            .catch((e) => console.error(e)) 
        },
        getBalance: async function(address, denom){
            return this.getAllBalances(address)
                .then((balances) => {
                    for (const balance of balances) {
                        if(balance.denom === denom){
                            return balance.amount
                        }
                    }
                    console.error(`coin with denom: ${denom} has not been found`)
                })
        },
    },
    global: {
        getInflation: async function(){
            return fetch(`https://api.cosmos.network/cosmos/mint/v1beta1/inflation`)
                .then((response) => response.json())
                .then((data) => {return data})
                .catch((e) => console.error(e))
        },
        getBondedTokenRatio: async function(){
            return fetch(`https://api.cosmos.network/cosmos/mint/v1beta1/params`)
                .then((response) => response.json())
                .then((data) => {return data})
                .catch((e) => console.error(e))
        }
    }

}

export {api};

/*

APY
Staking Fee
Staked
Pending Staking Reward


annual provisons: 38498735811762.946698919331052078
https://api.cosmos.network/cosmos/mint/v1beta1/annual_provisions




*/

