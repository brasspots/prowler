// add a listener to page load
chrome.webRequest.onCompleted.addListener(on_load, {'urls': ['*://*/*']}, []);

// define trigger on load
function on_load() {
  // debugging
  console.log("Prowler: sending")
  // send message to active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tab_list) {
    // send message
    chrome.tabs.sendMessage(tab_list[0].id, {action: "prowler_scan"}, function(responce) {})
    })
}
