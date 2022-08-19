export class Timer{

    constructor(fromDate, toDate, htmlElementTimeToWait){
        this.fromDate = fromDate
        this.toDate = toDate
        this.htmlElementTimeToWait = htmlElementTimeToWait
        this.differenceInMS = toDate.getTime() - fromDate.getTime()
        this.timingInterval = undefined
    }

    stop(interval){
        clearInterval(interval)
    }

    start() {
        chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: this.toDate.getTime() });

        this.stop(this.timingInterval)
        if (this.differenceInMS > 0) {
            this.timingInterval = setInterval(this.tick, 1000, this)
        }else{
            chrome.runtime.sendMessage({ cmd: 'TIME_IS_UP' });
        }
        return this.timingInterval
    }

    tick(mySelf){

        var distance = mySelf.toDate.getTime() - Date.now()
        if(distance < 0){
          this.stop()
        }
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        mySelf.displayCountdown(days,hours,minutes,seconds)
    }

    displayCountdown(days, hours, minutes, seconds){
        this.htmlElementTimeToWait.parentElement.classList.remove('collapsed')
        this.htmlElementTimeToWait.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`
    }

    getDifferenceInToken(staked, apr){
        return staked * this.differenceInMS * parseFloat(apr) / (365*24*60*60*1000)
    }
    
}