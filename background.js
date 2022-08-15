let timerID;
let timerTime;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    timerTime = new Date(request.when);
    timerID = setTimeout(() => {
        
    }, timerTime.getTime() - Date.now());
  } else if (request.cmd === 'GET_TIME') {
    sendResponse({ time: timerTime });
  } else if(request.cmd === 'TIME_IS_UP'){
    chrome.notifications.create('TIME_IS_UP', {
        type: 'basic',
        title: 'Claim & Stake',
        message: "It is time to claim and restake your reward",
        priority: 1
    })
  }

});


