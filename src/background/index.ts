// src/background.js

// Create a context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'myExtensionItem',
    title: 'Do Something',
    contexts: ['selection'], // This makes the item appear when text is selected
  });
});

// Listen for context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'myExtensionItem') {
    console.log("Context menu item 'Do Something' clicked");

    // Print the selected text to the background console
    if (info.selectionText) {
      console.log('Selected text: ', info.selectionText);
    } else {
      console.log('No text was selected.');
    }
  }
});
