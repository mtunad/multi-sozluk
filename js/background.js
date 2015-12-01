chrome.storage.sync.get({
	contextMenu: false
}, function(items) {
	if (items.contextMenu) createContextMenu();
	console.log(items);
});
  
function createContextMenu() {
	chrome.contextMenus.create({
		title: "Sözlükte %s", 
		contexts: ["selection"], 
		onclick: function(info, tab){ 
			chrome.tabs.create(
				{"url" : "chrome-extension://" + chrome.runtime.id + "/popup.html#" + info.selectionText }
			);
		}
	});
}
