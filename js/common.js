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

/**
 * Check if such arrow already exists
 * @param {String} key1 - key from
 * @param {String} key2 - key to
 */
function arrowExists(key1, key2) {
  var arr = {};
  arrows.forEach(function(arrow) {
      if (arrow.path.from.options.key == key1 && arrow.path.to.options.key == key2) {
          arr = arrow;
      }
  });
  return arr;
}

function checkDistance(x1, x2, y1, y2, radius) {
  return !((Math.abs(x1 - x2) <= 2 * radius + 2 * OFFSET) && (Math.abs(y1 - y2) <= 2 * radius + 2 * OFFSET));
}

function checkBackRelation(key1, key2) {
  var arr = {};
  arrows.forEach(function(arrow) {
      if (arrow.path.from.options.key == key2 && arrow.path.to.options.key == key1) {
          arr = arrow;
      }
  });
  return arr;
}

function calcOffset(x1, x2, y1, y2, radius) {
  var offset = {};
  var x = Math.abs(x1 - x2);
  var y = Math.abs(y1 - y2);
  var distance = Math.sqrt(x*x + y*y);
  var k = distance / radius;
  offset.x = x / k || 0;
  offset.y = y / k || 0;
  return offset;
}

function calcArrowTextCoordinates(xFrom, yFrom, xTo, yTo, doubleOffset) {
  var xOffset = Math.abs(xFrom - xTo) / 2;
  var yOffset = Math.abs(yFrom - yTo) / 2;
  var coordinates = {
    x: xFrom,
    y: yFrom
  }
  if (xFrom < xTo){
      if (yFrom < yTo) {
          coordinates.x += xOffset + 2 * doubleOffset;
          coordinates.y += yOffset + doubleOffset;
      } else {
          coordinates.x += xOffset + 2 * doubleOffset;
          coordinates.y -= yOffset - doubleOffset;
      }
  } else {
      if (yFrom < yTo) {
          coordinates.x -= xOffset - 2 * doubleOffset;
          coordinates.y += yOffset + 2 * doubleOffset;
      } else {
          coordinates.x -= xOffset - 2 * doubleOffset;
          coordinates.y -= yOffset - 2 * doubleOffset;
      }
  }
  return coordinates;
}

function drawArrowText(text, x, y) {
  return paper.text(x, y, text).attr({
      fill: "blue",
      "font-size": 18,
      "font-family": "Times New Roman"
  }).toFront();
}

function drawKey(x, y, text) {
  return paper.text(x, y, text).attr({
      "font-size": 14,
      "font-family": "Times New Roman"
  });
}

function drawName(x, y, text) {
  return paper.text(x, y + STATE_RADIUS + 2 * OFFSET, text).attr({
      fill: "blue",
      "font-size": 14,
      "font-family": "Times New Roman"
  });
}

/**
 * Remove arrow with keys = [key1, key2]
 * @param {String} key1 - key from
 * @param {Strinf} key2 - key to
 */
function removeArrow(key1, key2) {
  for (var i = arrows.length - 1; i >= 0; i--) {
      if(arrows[i].path.from.options.key == key1 && arrows[i].path.to.options.key == key2) {
          arrows[i].path.remove();
          arrows.splice(i, 1);
      }
  }
}