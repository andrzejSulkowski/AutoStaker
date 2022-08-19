

const nullthrows = (v) => {
    if (v == null) throw new Error("it's a null");
    return v;
}

let injectCode = function(src) {
    const script = document.createElement('script');
    // This is why it works!
    script.src = src;
    script.onload = function() {
        console.log("script injected");
        this.remove();
    };

    // This script runs before the <head> element is created,
    // so we add the script to <html> instead.
    nullthrows(document.head || document.documentElement).appendChild(script);
}



chrome.runtime.onMessage.addListener(actionObject => {
    // do something with msgObj
    if(actionObject.claim === true){
        injectCode(chrome.runtime.getURL('/myscript.js'));
    }else{

    }
    //injectCode(chrome.runtime.getURL('/myscript.js'))
});