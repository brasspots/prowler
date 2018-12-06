// initialiser function to get content <- This is SUPER hacky and should not be done, find a better way to do this
function get_file(gots, gets) {
  // check if all are got
  if (gets.length === 0) {
    // call main with list of file content (reverse so the order corrosponds with gets)
    main(gots.reverse())
  } else {
    // get chrome extension path of URL
    url = chrome.runtime.getURL(gets.pop());

    // debugging
    console.log("Prowler: Getting file: " + url);

    // initialise resource fetcher
    let fetcher = new XMLHttpRequest();
    // when resource has fetched
    fetcher.onreadystatechange = function() {
      if (fetcher.readyState == 4 && fetcher.status == 200) {
        // add content to gets
        gots.push(fetcher.responseText);
        // recurse
        get_file(gots, gets)
      }
    };
    // fetch resource
    fetcher.open("GET", url, true);
    fetcher.send();
  }
};

// main function
function main (files) {
  // initialise bad words and exceptions
  let bad_words = [];
  let exceptions = [];
  // load toggle values
  let w_scan = true;
  let i_scan = true;
  let w_redact = true;
  let i_redact = true;
  // get words out of files[0]
  parse_csv(bad_words, files[0]);
  // get URLs out of files[2]
  parse_csv(exceptions, files[2])
  // get warning head and body
  let warning_head = files[1].substring(files[1].indexOf('<head>') + 6, files[1].indexOf('</head>'));
  let warning_body = files[1].substring(files[1].indexOf('<body>') + 6, files[1].indexOf('</body>'));
  
  // add a listener to page load and initialise request count
  chrome.webRequest.onCompleted.addListener(request, {'urls': ['*://*/*']}, []);
  // add a listener to messages
  chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    // set request
    if (request.action === "prowler_popup_set") {
      // update toggles
      w_scan = request.w_scan;
      i_scan = request.i_scan;
      w_redact = request.w_redact;
      i_redact = request.i_redact
    } else if (request.action === "prowler_popup_get") {
      // send a response
      respond({scan_word: w_scan, scan_img: i_scan, redact_word: w_redact, redact_img: i_redact})
    }
  });
  let request_count = 0;
  // initialise sent status
  let sent = true;
  // debugging
  console.log("Prowler: bg loaded");
  
  // parse .csv
  function parse_csv(out_array, in_string) {
    let base_pointer = 0;
    for (let current_pointer = 0; current_pointer < in_string.length; current_pointer++) {
      // check for comma
      if (in_string[current_pointer] === ',') {
        // append the scanned value
        out_array.push(in_string.substring(base_pointer, current_pointer).replace('\n', ''));
        // update pointers
        base_pointer = current_pointer + 1
      }
    };
    // add last value if no trailing comma
    if (!in_string.endsWith(',')) {
      // append last value
      out_array.push(in_string.substring(base_pointer, in_string.length).replace('\n', ''))
    };
    console.log("Prowler: parsed .csv ".concat(out_array))
  };
  // request received
  function request() {
    // debugging
    console.log("Prowler: request");
    // increment request count
    request_count++;
    // check if handler's running
    if (sent === true) {
      sent = false;
      setTimeout(handle, 100)
    }
  };
  // send data to active tab
  function send_it() {
    // debugging
    console.log("Prowler: sending")
    // send message to active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tab_list) {
      // send message
      if (tab_list[0] !== undefined && tab_list[0].url !== undefined && !(check(tab_list[0].url))) {
        chrome.tabs.sendMessage(tab_list[0].id, {action: "prowler_scan", words: bad_words, head: warning_head, body: warning_body, scan_word: w_scan, scan_img: i_scan, redact_word: w_redact, redact_img: i_redact}, function(responce) {})
      }
    })
  };
  // check url against exceptions
  function check(url) {
    // check every exception
    for (let i = 0; i < exceptions.length; i++) {
      console.log(exceptions[i]);
      if (exceptions[i] !== "" && url.startsWith(exceptions[i])) {
        return true
      }
    };
    // url not exception
    return false
  };
  // send handler
  function handle() {
    // initialise previous time and previous count
    let previous_time = new Date().getTime();
    let previous_count = request_count;
    // forever checking
    while (true) {
      // debugging
      console.log("Prowler: checking, forever checking");
      // check requests
      if (request_count === previous_count) {
        if (new Date().getTime() - previous_time > 350) {
            previous_time = new Date().getTime();
            send_it();
            sent = true;
            return true
        }
      } else {
        previous_count = request_count
        sent = false;
      }
    }
  }
};


// load in file
get_file([], ["files/words.csv", "files/warning.html", "files/exceptions.csv"])
