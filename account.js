
export class Account{


    constructor(address, api){

        this.api = api
        this.address = address

    }
    async build() {
        return Promise.all([
            this.getPendingRewardBalance(this.address, "uatom"),
            this.getStakedBalance(this.address, "uatom"),
            this.getAvailableBalance(this.address, "uatom"),
            this.api.staking.getAllUsingValidators(this.address)
        ]).then((data) => {
            this.pendingStakingReward = parseFloat(data[0])
            this.staked = parseFloat(data[1])
            this.available = parseFloat(data[2])
            this.totalBalance = this.pendingStakingReward + this.staked + this.available
            this.lastUpdate = Date.now()

            this.validators = data[3].validators
        })
    }
    /*
    getpendingStakingReward(){

    }
    getStaked(){

    }
    getAvailable(){

    }
    getTotalBalance(){

    }
    getAddress(){

    }
    getLastUpdate(){

    }
    */
    async refresh(){
        return Promise.all([
            this.getPendingRewardBalance(this.address, "uatom"),
            this.getStakedBalance(this.address, "uatom"),
            this.getAvailableBalance(this.address, "uatom")
        ]).then((data) => {
            this.pendingStakingReward = data[0]
            this.staked = data[1]
            this.available = data[2]
            this.totalBalance = this.pendingStakingReward + this.staked + this.available
            this.lastUpdate = Date.now()
        })
    }


    // API CALLS
    async getAvailableBalance(address, denom){
        return await this.api.bank.getBalance(address, denom)
    }
    async getPendingRewardBalance(address, denom){
        return await this.api.staking.getAllPendingStakingRewards(address)
        .then((data) => {
            for (const totalBalance of data.total) {
            if(totalBalance.denom === denom){
                return totalBalance.amount
            }
            }
            return 0
        })
    }
    async getStakedBalance(address, denom){
        return await this.api.staking.getAllDelegations(address)
        .then((delegations) => {
            for (const delegation of delegations) {
            if(delegation.balance.denom === denom){
                return delegation.balance.amount
            }
            }
            return 0
        })
    }
}