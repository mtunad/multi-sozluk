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

chrome.commands.onCommand.addListener(function(command) {
		chrome.tabs.executeScript( {
			code: 'var selection = window.getSelection();if (selection.toString().length > 0){window.getSelection().toString();}else {selection.modify("move", "backward", "word");selection.modify("extend", "forward", "word");window.getSelection().toString();}'
		}, function(selection) {
			chrome.tabs.create({url: "/popup.html#"+selection[0] + "//" +command});
		});
});



