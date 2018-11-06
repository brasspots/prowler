// add a listener to page load
chrome.webRequest.onCompleted.addListener(on_load, {'urls': ['*://*/*']}, []);

// define trigger on load
function on_load() {
  console.log('Page loaded')
}
