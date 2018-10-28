// TODO: load in bad words
bad_words = ['iceberg', 'penguin'];
// initialise matches list and match_count
matches = [];
match_count = 0;
// TODO: check given string for mathces with bad_words
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
}

// main code

traverse(document.body)
alert(match_count)
