// send toggle updates to background script
function send_update() {
  chrome.runtime.sendMessage({action: "prowler_popup_set", w_scan: document.getElementById('scan_word_toggle').checked, i_scan: document.getElementById('scan_img_toggle').checked, w_redact: document.getElementById('redact_word_toggle').checked, i_redact: document.getElementById('redact_img_toggle').checked}, function (resonce) {});
};

// set all toggles to checked
let toggles = document.getElementsByTagName('input');
// iterate over toggles
for (let i = 0; i < toggles.length; i++) {
  // assert checkbox
  if (toggles[i].type === "checkbox") {
    // set checked and onclick
    toggles[i].checked = true;
    toggles[i].onclick = send_update
  }
};
// update
send_update()
