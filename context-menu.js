chrome.contextMenus.create({
  id: "TestMartAddElement",
  title: "Test Mart Add Element",
  documentUrlPatterns: ["<all_urls>"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == "TestMartAddElement"){
	  chrome.tabs.sendMessage(tab.id, {command: "toggle_active_state"});
  }
});


