// add a listener to page load
chrome.webRequest.onCompleted.addListener(on_load);

// define trigger on load
function on_load() {
  console.log('Page loaded')
}
