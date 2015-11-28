$(document).foundation();

$('h2 small').html(chrome.runtime.getManifest().version);

// Saves options to chrome.storage
function save_options() {
  var contextMenu = document.getElementById('contextMenu').checked;
  chrome.storage.sync.set({
    contextMenu: contextMenu
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Kaydedildi.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value
  chrome.storage.sync.get({
    contextMenu: false
  }, function(items) {
    document.getElementById('contextMenu').checked = items.contextMenu;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
$('#contextMenu').on('change', save_options);