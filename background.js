//chrome.browserAction.onClicked.addListener(function(tab) {
//    chrome.tabs.executeScript(null, {file: "addelement.js"});
// });
 

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript({
        file: 'jquery-3.5.1.js'
    }, function() {
        // Guaranteed to execute only after the previous script returns
        chrome.tabs.executeScript({
            file: 'addelement.js'
        });
    });
});