var DEBUG_MODE = false;

var CUSTOMER = "";
var PROJECT = "";
var SERVER = "";

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
	
	//console.log("tab.id=" + tab.id);
	//LogActiveTab();
	
	
    chrome.tabs.sendMessage(tab.id, {
        command: "toggle_active_state",
    },
    function(msg) {
        if (DEBUG_MODE === true) {
            console.log("<<< Content script message >>>", msg);
        }
    });
});


/*function LogActiveTab(){
	chrome.tabs.query({active: true}, function(tabs) {
	//chrome.tabs.query({lastFocusedWindow: true}, function(tabs) {	
		console.log("tabs.length=" + tabs.length);
		console.log("tabs[0].id=" + tabs[0].id);
		
		for (var i = 0; i < tabs.length; i++){
			    chrome.tabs.sendMessage(tabs[i].id, {command: "toggle_active_state"});
		}

	});	
}*/


// Set active or inactive badge on changing state of the extension
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'set_active') {
        chrome.browserAction.setBadgeText({text: '1'});
        chrome.browserAction.setBadgeBackgroundColor({color: '#0aff8c'});
    } else if (request.type === 'set_inactive') {
        chrome.browserAction.setBadgeText({text: '0'});
        chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000'});
   /* } else if (request.type === 'set_params') {
			chrome.storage.local.set(request.params);	
			CUSTOMER = request.params.CUSTOMER;
			PROJECT = request.params.PROJECT;
			SERVER = request.params.SERVER;	*/	
	} else if (request.type === 'get_server') {
		sendResponse(SERVER);
	}
    else if (request.type === 'get_customer') {
		sendResponse(CUSTOMER);
	}
    else if (request.type === 'get_project') {
		sendResponse(PROJECT);
	}
	else{
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


chrome.storage.local.get(["CUSTOMER", "PROJECT", "SERVER"], function (items) {
	if (items.CUSTOMER){
		CUSTOMER = items.CUSTOMER;
	} 	
	
	if (items.PROJECT){
		PROJECT = items.PROJECT;
	} 

	if (items.SERVER){
		SERVER = items.SERVER;
	} 	
});


 chrome.webRequest.onBeforeRequest.addListener(function (details) {
		 
		 var objURL = new URL(details.url);
		 if (objURL.searchParams.has("customer")){
			CUSTOMER = objURL.searchParams.get("customer");
			console.log("CUSTOMER=" + objURL.searchParams.get("customer")); 
		 }
		 if (objURL.searchParams.has("project")){
			PROJECT = objURL.searchParams.get("project");
			console.log("PROJECT=" + objURL.searchParams.get("project")); 
		 }		 
		 if (objURL.searchParams.has("server")){
			SERVER = objURL.searchParams.get("serverelement");
			console.log("SERVER=" + objURL.searchParams.get("server")); 
		 }
		 
		var newparams = {}; 
		newparams.CUSTOMER = CUSTOMER;
		newparams.PROJECT = PROJECT;
		newparams.SERVER = SERVER;
		 	
		chrome.storage.local.set(newparams);			
		 
		 return {redirectUrl: 'javascript:void(0)'};
		// return {cancel:true}
	 }, { urls: ["*://*.testmartsetparams.com/*"] }, ['blocking']);	
	
	
	