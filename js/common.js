/**
 * Check if object is empty
 * @param {Object} obj 
 */
function isEmpty(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
}

/**
 * Clear element's selection
 */
function clearSelection() {
  if (selected != null) {
      selected.remove();
      selected = null;
  }
}

/**
 * Get next index for adding element
 * @param {Object} nodes 
 */
function nextIndex(nodes) {
  var lastKey = 0;
  var keys = Object.keys(nodes);
  var keysLength = keys.length;
  if (keysLength > 0) {
      lastKey = +keys[keysLength - 1].slice(1); // becouse key looks like "p3" or "q2"
  }
  return lastKey + 1;
}