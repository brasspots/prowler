// send toggle updates to background script
function send_update() {
  chrome.runtime.sendMessage({action: "prowler_popup_set", w_scan: document.getElementById('scan_word_toggle').checked, i_scan: document.getElementById('scan_img_toggle').checked, w_redact: document.getElementById('redact_word_toggle').checked, i_redact: document.getElementById('redact_img_toggle').checked}, function (response) {});
};

// get toggle values from background script
function get_update() {
  // send request
  chrome.runtime.sendMessage({action: "prowler_popup_get"}, function (response) {
    // initialise toggle state array from background and got flag
    let toggle_values = [response.scan_word, response.scan_img, response.redact_word, response.redact_img];
    // set all toggles to their state from background
    let toggles = document.getElementsByTagName('input');
    // iterate over toggles
    for (let i = 0; i < toggles.length; i++) {
      // assert checkbox
      if (toggles[i].type === "checkbox") {
        // set checked and onclick
        toggles[i].checked = toggle_values[i];
        toggles[i].onclick = send_update;
      }
    }
  })
};

// get update to load initial values
get_update();
