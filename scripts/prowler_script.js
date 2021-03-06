// debug log
console.log('Prowler: Loaded Prowler')
// initialise match frequency, matches list, match_count, state and waiting
let match_freq = {};
let matches = [];
let match_count = 0;
let state = "prowling";
let waiting = true;
// initialise scan and redact bools
let scan_word = true;
let scan_img = true;
let redact_word = true;
let redact_img = true;
// get bad words
let bad_words = [];
// get warning head and body
let warning_head = "";
let warning_body = "";
// add chrome message listener
chrome.runtime.onMessage.addListener(scan);

// functions

// check given string for mathces with bad_words
function string_check(text) {
  // check for undefined value
  if (text === undefined) {
    // word cannot be in undefined
    return false
  } else {
    // initialise hit flag
    hit = false;
    for (let i = 0; i < bad_words.length; i++) {
      // search for a match
      if (text.toUpperCase().includes(bad_words[i].toUpperCase())) {
        // set hit and increment match_count
        hit = true;
        match_count++;
        // increase frequency
        if (bad_words[i] in match_freq) {
          match_freq[bad_words[i]]++
        } else {
          match_freq[bad_words[i]] = 1
        }
      }
    };
    // return if there has been a match
    return hit
  }
};
// recursive function to traverse DOM and get to end nodes
function traverse(element) {
  // end of tree
  if (element.childElementCount === 0) {
    // search alt if element is img
    if (element.tagName === 'IMG' && scan_img === true) {
      if (string_check(element.alt)) {
        matches.push(element);
      }
    // search innerText if innerText is not blank
    } else if (element.innerText !== '' && scan_word === true) {
      if (string_check(element.innerText)) {
        matches.push(element);
      }
    }
  // recurse funcrion on all elements
  } else {
    for (let i = 0; i < element.childElementCount; i++) {
      traverse(element.children[i])
    }
  }
};
// change page content to warning
function show_warning() {
  // change head and body
  document.head.innerHTML = warning_head;
  document.body.innerHTML = warning_body;
  // load in critter count
  document.getElementById('critter_count').innerText = match_count;
  // add button listeners
  document.getElementById('table_button').addEventListener('click', show_table);
  document.getElementById('continue_no_change').addEventListener('click', revert_page);
  document.getElementById('continue_and_redact').addEventListener('click', redact_page);
  document.getElementById('go_back').addEventListener('click', go_back)
};
// show the table
function show_table() {
  // get pre table
  let element = document.getElementById('pre_table');
  // make table rows
  let table_content = '';
  Object.keys(match_freq).forEach(
    function (key) {
      // add rows
      table_content = table_content.concat('<tr>', '<td>', key, '</td>', '<td>', match_freq[key].toString(), '</td>', '</tr>')
    }
  );
  // set to table
  element.innerHTML = '<table>'.concat(table_content, '</table><br>')
};
// revert to original page
function revert_page() {
  // change head and body
  document.head.innerHTML = original_head;
  document.body.innerHTML = original_body;
  // update state and waiting
  state = "sleeping";
  waiting = true
};
// revert to original page and redact bad words
function redact_page() {
  // change head and body
  document.head.innerHTML = original_head;
  document.body.innerHTML = original_body;
  // get matches again
  traverse(document.body);
  // redact elements
  for (let i = 0; i < matches.length; i++) {
    // redact ALT of images
    if (matches[i].tagName === 'IMG' && redact_img === true) {
      matches[i].alt = redact_string(matches[i].alt)
    } else if (redact_word === true) {
    // redact text of element
      matches[i].innerText = redact_string(matches[i].innerText)
    };
  };
  // redact src of all images
  if (redact_img === true) {
    images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      // redact both src and srcset
      images[i].src = chrome.runtime.getURL('/files/black_square.png');
      images[i].srcset = chrome.runtime.getURL('/files/black_square.png');
    }
  };
  // update state and waiting
  state = "redacting";
  waiting = true
};
// redact a string of bad words
function redact_string(bad_string) {
  // replace every bad word
  for (let i = 0; i < bad_words.length; i++) {
    while (bad_string.toUpperCase().includes(bad_words[i].toUpperCase())) {
      // find bad word index
      let start_index = bad_string.toUpperCase().indexOf(bad_words[i].toUpperCase())
      // replace the word
      bad_string = bad_string.substring(0, start_index) + '\u2588'.repeat(bad_words[i].length) + bad_string.substring(start_index + bad_words[i].length, bad_string.length)
    }
  };
  // return redacted string
  return bad_string
};
// go back a page
function go_back() {
  history.back();
  // update waiting
  waiting = true
};
// scan the page
function scan(request, sender, respond) {
  // debugging
  console.log("Prowler: received");
  // unpack request if it is for us
  if (request.action === "prowler_scan" && waiting === true) {
    // update variables from request
    bad_words = request.words;
    warning_head = request.head;
    warning_body = request.body;
    // scan and redact bools
    scan_word = request.scan_word;
    scan_img = request.scan_img;
    redact_word = request.redact_word;
    redact_img = request.redact_img;
    // get original head and body
    window.original_head = document.head.innerHTML;
    window.original_body = document.body.innerHTML;
    // scan html for bad words
    traverse(document.body);
    // new critters detected
    if (match_count !== 0) {
      // update waiting
      waiting = false;
      // ready state
      if (state === "prowling") {
        // display warning
        show_warning()
      } else if (state === "redacting") {
        // redact page
        redact_page()
      } else {
        waiting = true
      }
    }
  }
}
