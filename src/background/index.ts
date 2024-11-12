let selectedText = '';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveText',
    title: 'Save Selected Text',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'saveText' && info.selectionText) {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});
