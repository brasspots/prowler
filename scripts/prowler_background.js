// get starting time
last_request_time = (new Date()).getTime();
// add a listener to page load
chrome.webRequest.onCompleted.addListener(on_load, {'urls': ['*://*/*']}, []);

// define trigger on load
function on_load() {
  // debugging
  console.log("Prowler: on_load called");
  // get current time
  current_request_time = (new Date()).getTime();
  time_dif = current_request_time - last_request_time
  // update last reuest time
  last_request_time = current_request_time
  // check for suitable time dif
  if (time_dif > 50) {
    // debugging
    console.log("Prowler: message sent");
    // send message to active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tab_list) {
      // send message
      chrome.tabs.sendMessage(tab_list[0].id, {action: "prowler_scan"}, function(responce) {})
    })
  }
}
