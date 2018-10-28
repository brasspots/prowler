// initialiser function to get content <- This is SUPER hacky and should not be done, find a better way to do this
function get_file(gots, gets) {
  // check if all are got
  if (gets.length === 0) {
    // call main with list of file content (reverse so the order corrosponds with gets)
    main(gots.reverse())
  } else {
    // get chrome extension path of URL
    url = chrome.runtime.getURL(gets.pop());
    // initialise resource fetcher
    let fetcher = new XMLHttpRequest();
    // when resource has fetched
    fetcher.onreadystatechange=function() {
      if (fetcher.readyState==4 && fetcher.status==200) {
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

function main(files) {
  // initialise matches list and match_count
  let matches = [];
  let match_count = 0;
  
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
          match_count++
        }
      };
      // return if there has been a match
      return hit
    }
  };
  // recursive function to traverse DOM and get to end nodes
  function traverse(element){
    // end of tree
    if (element.childElementCount === 0) {
      // search alt if element is img
      if (element.tagName === 'IMG') {
        if (string_check(element.alt)) {
          matches.push(element)
        }
      // search innerText if innerText is not blank
      } else if (element.innerText !== '') {
        if (string_check(element.innerText)) {
          matches.push(element)
        }
      }
    // recurse funcrion on all elements
    } else {
      for (let i = 0; i < element.childElementCount; i++) {
        traverse(element.children[i])
      }
    }
  };
  // TODO: change page content to warning

  // main code
  console.log(files)
};

// start the script
files = ['files/words.csv', 'files/warning.html'];
get_file([], files)
