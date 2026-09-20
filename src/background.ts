chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'send-to-phinale',
    title: 'Send to Phinale',
    contexts: ['selection', 'link', 'image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'send-to-phinale') return;
  const text = info.selectionText ?? info.linkUrl ?? info.srcUrl ?? '';
  if (!text) return;
  await chrome.storage.local.set({ 'phinale-inbox': { content: text, at: Date.now() } });
});
