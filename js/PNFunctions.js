/**
 * Get next index for adding element
 * @param {Object} nodes 
 */
function nextIndex(nodes) {
    var lastKey = 0;
    var keys = Object.keys(nodes);
    var keysLength = keys.length;
    if (keysLength > 0) {
        lastKey = +keys[keysLength - 1].slice(1); // becouse key looks like "p3"
    }
    return lastKey + 1;
}

/** 
 * -------------------------------
 *   WORKING WITH CLEARING INFO
 * -------------------------------
 */

/**
 * Clear all information about old Petri net
 */
function ResetPetriNet() {
    places = {};
    transitions = {};
    arrows = [];
    selected = null;
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
 * Remove selected element and information about it (place/transition/arrow)
 */
function removeSelected() {
    if (!selected) return;
    var node = selected.node;
    var key = node.key;
    
    switch (node.type) {
        case "circle":
            removeAllTokens(node);
            removeNode(node);
            delete places[key];
            break;
        case "rect":
            removeNode(node);
            delete transitions[key];
            break;
        case "path":
            if (node.count > 1) {
                node.text.remove();
                node.count --;
                if (node.count > 1) {
                    node.text = drawCount(node.count, node.from.x, node.from.y, node.to.x, node.to.y, node.from.type);
                }
            } else {
                removeArrow(node.keys[0], node.keys[1]);
            }
            break;
    }
    clearSelection();
}

/**
 * Remove selected node (place/transition/arrow)
 * @param {Object} node - deleted element
 */
function removeNode(node) {
    if(node.caption) {
        node.caption.remove();
    }
    if (node.name) {
        node.name.remove();
    }
    if (node.text) {
        node.text.remove();
    }
    if (node.path) {
        node.path.remove();
    }
    node.remove();
}

/**
 * Remove arrow with keys = [key1, key2]
 * @param {String} key1 - key from
 * @param {Strinf} key2 - key to
 */
function removeArrow(key1, key2) {
    for (var i = arrows.length - 1; i >= 0; i--) {
        if((arrows[i].path.from.key == key1 && arrows[i].path.to.key == key2) || (arrows[i].path.from.key == key2 && arrows[i].path.to.key == key1)) {
            arrows[i].path.remove();
            arrows.splice(i, 1);
        }
    }
}

/** 
 * -------------------------------
 *       WORKING WITH ADDING
 *      PLACE, TRANSITION, ARROWS
 * -------------------------------
 */

/**
 * Adding place to canvas
 * @param {String} key - place's name
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @param {Number} tokens - number of tokens
 */
function addPlace(key, x, y, tokens) {
    var newPlace = paper.circle(x, y, PLACE_RADIUS).attr({ 
            fill: "#FFF", 
            stroke: "#000"
        });

    // event handlers for the element
    newPlace.drag(dragOnMove, dragOnStart, dragOnEnd);
    newPlace.click(nodeClick);
    newPlace.mouseup(nodeMouseUp);

    // property initialization
    newPlace.x = x;
    newPlace.y = y;
    newPlace.key = key;
    newPlace.tokens = new Array(tokens);
    newPlace.caption = drawKey(key, x, y);

    // transform coordinates
    newPlace.dx = 0; 
    newPlace.dy = 0;

    drawTokens(newPlace.tokens, newPlace.x, newPlace.y);
    places[key] = newPlace;
    return newPlace;
}

/**
 * Adding transition to canvas
 * @param {String} key - transition's name
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @param {String} name - language symbol
 */
function addTransition(key, x, y, name) {
    var newTransition = paper.rect(x - TRANSITION_WIDTH / 2, y - TRANSITION_HEIGHT / 2, TRANSITION_WIDTH, TRANSITION_HEIGHT).attr({ 
            fill: "#FFF", 
            stroke: "#000"
        });

    // event handlers for the element
    newTransition.drag(dragOnMove, dragOnStart, dragOnEnd);
    newTransition.click(nodeClick);
    newTransition.mouseup(nodeMouseUp);

    // property initialization
    newTransition.x = x;
    newTransition.y = y;
    newTransition.key = key;
    newTransition.caption = drawKey(key, x, y);
    if (name) {
        newTransition.name = drawName(name, x, y);
    }

    // transform coordinates
    newTransition.dx = 0; 
    newTransition.dy = 0;

    transitions[key] = newTransition;
    return newTransition;
}

function addArrow(node1, node2) {
    var arrow;
    if (node1.key.substr(0, 1) != node2.key.substr(0, 1)) { // nodes of different types 
        arrow = arrowExists(node1.key, node2.key);
        if (!isEmpty(arrow)) {
            arrow.path.count ++;
            if (arrow.path.text) {
                arrow.path.text.remove();
            }
            var xTo = arrow.path.attrs.path[1][1];
            var yTo = arrow.path.attrs.path[1][2];
            var xFrom = arrow.path.attrs.path[0][1];
            var yFrom = arrow.path.attrs.path[0][2];
            arrow.path.text = drawCount(arrow.path.count, xFrom, yFrom, xTo, yTo, node1.type);
        } else {         
            if (!((Math.abs(node1.x - node2.x) <= 2*PLACE_RADIUS + 10) && (Math.abs(node1.y - node2.y) <= 2*PLACE_RADIUS + 10))) {
                arrow.path = addArrowPath(node1.x, node1.y, node2.x, node2.y, node1.type);
                arrow.path.count = 1;
                arrow.path.from = node1;
                arrow.path.to = node2;
                arrow.path.keys = [node1.key, node2.key];
                arrow.path.click(nodeClick);
                arrows.push(arrow);
            } 
        }    
    }
    return arrow;
}

function addArrowPath(xFrom, yFrom, xTo, yTo, startType) {
    var path = {};
    if ((Math.abs(xFrom - xTo) <= 2*PLACE_RADIUS + 10) && (Math.abs(yFrom - yTo) <= 2*PLACE_RADIUS + 10)) {
        path = paper.path("M" + xFrom + "," + yFrom + "L" + xFrom + "," + yFrom).attr({ "stroke": "black"}); // fictitious-empty arrow
    } else {
        var attrPath = { "stroke": "black", "stroke-width": 2, "arrow-end": "block-wide-long" };
        var x = Math.abs(xFrom - xTo);
        var y = Math.abs(yFrom - yTo);
        var distance = Math.sqrt(x*x + y*y);
        var k = distance / PLACE_RADIUS;
        var xOffxet = x / k || 0;
        var yOffset = y / k || 0;

        var doubleOffset;
        if (startType === "circle") {
            doubleOffset = 6;
        } else {
            doubleOffset = -6;
        }
        if (xFrom < xTo) {
            if (yFrom < yTo) {
                path = paper.path("M" + (xFrom + xOffxet) + "," + (yFrom + yOffset + doubleOffset) + "L" + (xTo - xOffxet) + "," + (yTo - yOffset + doubleOffset)).attr(attrPath);
            } else {
                path = paper.path("M" + (xFrom + xOffxet) + "," + (yFrom - yOffset + doubleOffset) + "L" + (xTo - xOffxet) + "," + (yTo + yOffset + doubleOffset)).attr(attrPath);
            }
        } else {
            if (yFrom < yTo) {
                path = paper.path("M" + (xFrom - xOffxet) + "," + (yFrom + yOffset + doubleOffset) + "L" + (xTo + xOffxet) + "," + (yTo - yOffset + doubleOffset)).attr(attrPath);
            } else {
                path = paper.path("M" + (xFrom - xOffxet) + "," + (yFrom - yOffset + doubleOffset) + "L" + (xTo + xOffxet) + "," + (yTo + yOffset + doubleOffset)).attr(attrPath);
            }
        }
    }
    return path;
}

/**
 * Check if such arrow already exists
 * @param {String} key1 - key from
 * @param {String} key2 - key to
 */
function arrowExists(key1, key2) {
    var arr = {};
    arrows.forEach(function(arrow) {
        if (arrow.path.from.key == key1 && arrow.path.to.key == key2) {
            arr = arrow;
        }
    });
    return arr;
}

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
 * -------------------------------
 *      HENDLERS FOR ELEMENT
 * -------------------------------
 */

function nodeMouseUp(e) {
    if (e.ctrlKey && tempArrowActive) {
        tempArrow.path.remove();
        addArrow(tempArrow.from, this);
    }
}

/**
 * Selection place by clicking
 * @param {Object} e 
 */
function nodeClick(e) {
    if (selected) {
        clearSelection();
    }

    var selectionDash;
    var selectionAttr = { "stroke": "#808080", "stroke-dasharray": "- "};
    switch (this.type) {
        case "circle":
            var x = this.x;
            var y = this.y;
            selectionDash = paper.rect(x - PLACE_RADIUS, y - PLACE_RADIUS, 2 * PLACE_RADIUS, 2 * PLACE_RADIUS).attr(selectionAttr).toBack();
            break;
        case "rect":
            var x = this.x;
            var y = this.y;
            if (this.name) {
                selectionDash = paper.rect(x - TRANSITION_WIDTH / 2 - OFFSET , y - TRANSITION_HEIGHT /2 - TRANSITION_WIDTH, 1.5 * TRANSITION_WIDTH, TRANSITION_HEIGHT + 2 * TRANSITION_WIDTH).attr(selectionAttr).toBack();
            } else {
                selectionDash = paper.rect(x - TRANSITION_WIDTH / 2 - OFFSET , y - TRANSITION_HEIGHT /2 - OFFSET, 1.5 * TRANSITION_WIDTH, TRANSITION_HEIGHT + TRANSITION_WIDTH + OFFSET).attr(selectionAttr).toBack();
            }
            break;
        case "path":
            var path = this.attr("path");
            var x1 = path[0][1];
            var y1 = path[0][2];
            var x2 = path[1][1];
            var y2 = path[1][2];
            var width = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            //var deg  = Math.atan2(Math.tan(y1 - y2, x1 - x2)) * 180 / Math.PI;
            var deg  = Math.atan2(Math.abs(y1 - y2), Math.abs(x1 - x2)) * 180 / Math.PI;

            if (x1 < x2) {
                if (y1 < y2) {
                    y1 = y1 - SELECTION_ARROW_HEIGHT / 2;
                } else {
                    deg = -deg;
                    y1 = y1 - SELECTION_ARROW_HEIGHT / 2;
                }
            } else {
                if (y1 < y2) {
                    deg = 180 - deg;
                    y1 = y1 + SELECTION_ARROW_HEIGHT / 2;
                } else {
                    deg = 180 + deg;
                    y1 = y1 + SELECTION_ARROW_HEIGHT / 2;
                }
            }
            selectionDash = paper.rect(x1, y1, width, SELECTION_ARROW_HEIGHT).attr(selectionAttr).rotate(deg, x1, y1).toBack();
            break;
    }
    selected = paper.set();
    selected.push(selectionDash);
    selected.node = this;
}

/** 
 * Before moving
*/
function dragOnStart(x, y, e) {
    if(e.ctrlKey) {
        tempArrow.x = this.x;
        tempArrow.y = this.y;
        tempArrow.from = this;
    } else {
        this.currentTransform = this.transform(); // Save current element's position
        clearSelection();
    }
}

/**
 * While moving
 * @param {Number} dx - x moving
 * @param {Number} dy - y moving
 */
function dragOnMove(dx, dy, x, y, e) {
    if (!e.ctrlKey) {
        this.dx = dx;
        this.dy = dy;
        this.transform(this.currentTransform + "t" + dx + ',' + dy); // moving from Raphael documentation
        this.caption.remove();
        this.caption = drawKey(this.key, this.x + dx, this.y + dy); // redraw key
        if (this.tokens && this.tokens.length) { // redraw tikens for place
            removeAllTokens(this);
            drawTokens(this.tokens, this.x + dx, this.y + dy);
        }
        if (this.name) { // redraw name for transition
            var name = this.name.attrs.text;
            this.name.remove();
            this.name = drawName(name, this.x + dx, this.y + dy);
        }
        redrawArrows(this, this.x + dx, this.y + dy);
    } else {
        if (tempArrow.path != null) tempArrow.path.remove();
        if (Math.abs(tempArrow.x - this.x + dx) > PLACE_RADIUS) {
            tempArrow.path = paper.path("M" + tempArrow.x + "," + tempArrow.y + "L" + (this.x + dx) + "," + (this.y + dy)).attr({ "stroke": "black", "stroke-width": 2, "stroke-dasharray": "- ", "arrow-end": "block-midium-long" });
            tempArrowActive = true;
        }
    }
}

/**
 * After moving
 */
function dragOnEnd(e) {
    if (!e.ctrlKey) {
        this.x += parseInt(this.dx) || 0; // current x
        this.y += parseInt(this.dy) || 0; //current y
        this.dx = 0; //Reset transform
        this.dy = 0;
        this.currentTransform = this.transform(); // Save current element's position
    }
}

/** 
 * -------------------------------
 *       WORKING WITH TOKENS
 * -------------------------------
 */

/**
 * Draw tokens into the place
 * @param {Number} tokens - array of tokens
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 */
function drawTokens(tokens, x, y) {
    var tokenAttr = {
        fill: "black",
        stroke: "black",
        "stroke-width": 0
    };
    var textAttr = {
        fill: "black",
        "font-size": 16,
        "font-family": "Times New Roman",
        "font-weight": "bold"
    };
    switch (tokens.length) {
        case 0:
            break;
        case 1:
            tokens[0] = paper.circle(x, y, TOKEN_RADIUS).attr(tokenAttr);
            break;
        case 2:
            tokens[0] = paper.circle(x - TOKEN_RADIUS - 1, y, TOKEN_RADIUS).attr(tokenAttr);
            tokens[1] = paper.circle(x + TOKEN_RADIUS + 1, y, TOKEN_RADIUS).attr(tokenAttr);
            break;
        default:
            tokens[0] = paper.text(x, y, tokens.length.toString()).attr(textAttr);;
    }
}

/**
 * Add 1 token to place
 * @param {Object} place - element of Petri net
 */
function addToken(place) {
    if (!selected) return;
    var tokensCount = place.tokens.length + 1;
    removeAllTokens(place); // remove all tokens
    place.tokens = new Array(tokensCount);
    drawTokens(place.tokens, place.x, place.y); // redraw
}

/**
 * Remove 1 token from selected place
 * @param {Object} place - element of Petri net
 */
function removeToken(place) {
    if (!selected || place.tokens.length == 0) return;
    var tokensCount = place.tokens.length - 1;
    removeAllTokens(place); // remove all tokens
    place.tokens = new Array(tokensCount);
    drawTokens(place.tokens, place.x, place.y); //redraw
}

/**
 * Remove all tokens from selected place
 * @param {Object} place - element of Petri net
 */
function removeAllTokens(place) {
    for (var i = 0; i < place.tokens.length; i++) {
        if(place.tokens[i] != undefined) {
            place.tokens[i].remove();
        }    
    }
}

/** 
 * -------------------------------
 *       WORKING WITH TEXT
 * -------------------------------
 */

/**
 * Draw text under the place/transition
 * @param {String} text - text under the place/transition
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 */
function drawKey(text, x, y) {
    return paper.text(x, y + PLACE_RADIUS + 10, text).attr({
        fill: "blue",
        "font-size": 14,
        "font-family": "Times New Roman"
    });
}

/**
 * Draw text above the transitions - name
 * @param {String} text - transition's name
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinte
 */
function drawName(text, x, y) {
    return paper.text(x, y - TRANSITION_HEIGHT / 2 - 10, text).attr({
        fill: "blue",
        "font-size": 14,
        "font-family": "Times New Roman"
    });
}

function drawCount(count, xFrom, yFrom, xTo, yTo, startType) {
    var xOffset = Math.abs(xFrom - xTo) / 2;
    var yOffset = Math.abs(yFrom - yTo) / 2;
    var xCenter = xFrom;
    var yCenter = yFrom;
    var doubleOffset;
    if (startType === "circle") {
        doubleOffset = 3;
    } else {
        doubleOffset = -3;
    }
    if (xFrom < xTo){
        if (yFrom < yTo) {
            xCenter += xOffset + 2 * doubleOffset;
            yCenter += yOffset + doubleOffset;
        } else {
            xCenter += xOffset + 2 * doubleOffset;
            yCenter -= yOffset - doubleOffset;
        }
    } else {
        if (yFrom < yTo) {
            xCenter -= xOffset - 2 * doubleOffset;
            yCenter += yOffset + doubleOffset;
        } else {
            xCenter -= xOffset - 2 * doubleOffset;
            yCenter -= yOffset - doubleOffset;
        }
    }
    return paper.text(xCenter, yCenter, count).attr({
        fill: "blue",
        "font-size": 18,
        "font-family": "Times New Roman"
    }).toFront();
}

function redrawArrows(node, x, y) {
    arrows.forEach(function(arrow, index) {
        if (arrow.path.from.key == node.key) {
            var arrowTo = arrow.path.to;
            var arrowFrom = arrow.path.from;
            var arrowCount = arrow.path.count;
            var arrowKeys = arrow.path.keys;
            if (arrow.path.text) {
                arrow.path.text.remove();
            }
            arrow.path.remove();
            arrow.path = addArrowPath(x, y, arrowTo.x, arrowTo.y, node.type);
            arrow.path.from = arrowFrom;
            arrow.path.to = arrowTo;
            arrow.path.count = arrowCount;
            arrow.path.keys = arrowKeys;
            if ((Math.abs(x - arrowTo.x) <= 2*PLACE_RADIUS + 10) && (Math.abs(y - arrowTo.y) <= 2*PLACE_RADIUS + 10)) {
                if (arrow.text) {
                    //arrow.text.remove();
                }
            } else if (arrowCount > 1) {
                var xTo = arrow.path.attrs.path[1][1];
                var yTo = arrow.path.attrs.path[1][2];
                arrow.path.text = drawCount(arrowCount, x, y, xTo, yTo, node.type);
            }
            arrow.path.click(nodeClick);
        }
        else if (arrow.path.to.key == node.key) {
            var arrowTo = arrow.path.to;
            var arrowFrom = arrow.path.from;
            var arrowCount = arrow.path.count;
            var arrowKeys = arrow.path.keys;
            if (arrow.path.text) {
                arrow.path.text.remove();
            }
            arrow.path.remove();
            arrow.path = addArrowPath(arrowFrom.x, arrowFrom.y, x, y, arrowFrom.type);
            arrow.path.from = arrowFrom;
            arrow.path.to = arrowTo;
            arrow.path.count = arrowCount;
            arrow.path.keys = arrowKeys;
            if ((Math.abs(arrowFrom.x - x) <= 2*PLACE_RADIUS + 10) && (Math.abs(arrowFrom.y - y) <= 2*PLACE_RADIUS + 10)) {
                if (arrow.path.text) {
                    //arrow.path.text.remove();
                }
            } else if (arrowCount > 1) {
                var xFrom = arrow.path.attrs.path[0][1];
                var yFrom = arrow.path.attrs.path[0][2];
                arrow.path.text = drawCount(arrowCount, xFrom, yFrom, x, y, arrow.path.from.type);
            }
            arrow.path.click(nodeClick);
        }
    });
}