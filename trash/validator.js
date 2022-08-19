class Validator{
    constructor(name, address, communityTax){
        this.name = name
        this.address = address
        this.communityTax = communityTax
    }

    apy(inflation, communityTax, bondedTokensRatio){
        return (inflation * (1-communityTax))/bondedTokensRatio
    }
}