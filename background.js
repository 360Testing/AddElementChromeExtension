var DEBUG_MODE = false;

var jQuery_loaded = "jQuery_not_loaded"
if (jQuery) {  
    jQuery_loaded = "jQuery_loaded"
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {
        command: jQuery_loaded,
    },
    function(msg) {
        if (DEBUG_MODE === true) {
            console.log("<<< Content script message >>>", msg);
        }
    });
});

// Toggle active state on click of the extension
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {
        command: "toggle_active_state",
    },
    function(msg) {
        if (DEBUG_MODE === true) {
            console.log("<<< Content script message >>>", msg);
        }
    });
});

// Set active or inactive badge on changing state of the extension
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'set_active') {
        chrome.browserAction.setBadgeText({text: '1'});
        chrome.browserAction.setBadgeBackgroundColor({color: '#0aff8c'});
    } else if (request.type === 'set_inactive') {
        chrome.browserAction.setBadgeText({text: '0'});
        chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000'});
    } else{
        chrome.tabs.sendMessage(tab.id, {
            command: request.type,
        },
        function(msg) {
            if (DEBUG_MODE === true) {
                console.log("<<< Content script message >>>", msg);
            }
        });
    }
    return true;
});

// Deactivate extension if active tab is changed
chrome.tabs.onActiveChanged.addListener(function(tabId, selectInfo) {
    chrome.tabs.sendMessage(tabId, {
        command: "set_inactive",
    },
    function(msg) {
        if (DEBUG_MODE === true) {
            console.log("<<< Content script message >>>", msg);
        }
    });
});

// Deactivate extension if active tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.sendMessage(tabId, {
        command: "set_inactive",
    },
    function(msg) {
        if (DEBUG_MODE === true) {
            console.log("<<< Content script message >>>", msg);
        }
    });
});