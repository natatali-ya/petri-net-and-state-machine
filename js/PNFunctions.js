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
    arcs = [];
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
 * -------------------------------
 *       WORKING WITH ADDING
 *      PLACE, TRANSITION, ARCS
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
    newPlace.click(placeClick);
    //newPlace.mouseup(placeMouseUp);

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

function addTransition(key, x, y, name) {
    var newTransition = paper.rect(x - TRANSITION_WIDTH / 2, y - TRANSITION_HEIGHT / 2, TRANSITION_WIDTH, TRANSITION_HEIGHT).attr({ 
            fill: "#FFF", 
            stroke: "#000"
        });

    // event handlers for the element
    newTransition.drag(dragOnMove, dragOnStart, dragOnEnd);
    newTransition.click(placeClick);
    // //newPlace.mouseup(placeMouseUp);

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

/** 
 * -------------------------------
 *      HENDLERS FOR ELEMENT
 * -------------------------------
 */

/**
 * Selection place by clicking
 * @param {Object} e 
 */
function placeClick(e) {
    if (selected) {
        clearSelection();
    }
    var x = this.x;
    var y = this.y;

    var selectionDash;
    var selectionAttr = { "stroke": "#808080", "stroke-dasharray": "- "};
    switch (this.type) {
        case "circle":
            selectionDash = paper.rect(x - PLACE_RADIUS, y - PLACE_RADIUS, 2 * PLACE_RADIUS, 2 * PLACE_RADIUS).attr(selectionAttr).toBack();
            break;
        case "rect":
            if (this.name) {
                selectionDash = paper.rect(x - TRANSITION_WIDTH / 2 - 5 , y - TRANSITION_HEIGHT /2 - 20, TRANSITION_WIDTH + 10, TRANSITION_HEIGHT + 40).attr(selectionAttr).toBack();
            } else {
                selectionDash = paper.rect(x - TRANSITION_WIDTH / 2 - 5 , y - TRANSITION_HEIGHT /2 - 5, TRANSITION_WIDTH + 10, TRANSITION_HEIGHT + 25).attr(selectionAttr).toBack();
            }
            break;
        case "arc":
            break;
    }
    selected = paper.set();
    selected.push(selectionDash);
    selected.node = this;
}

/** 
 * Before moving
*/
function dragOnStart() {
    this.currentTransform = this.transform(); // Save current element's position
    clearSelection();
}

/**
 * While moving
 * @param {Number} dx - x moving
 * @param {Number} dy - y moving
 */
function dragOnMove(dx, dy) {
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
}

/**
 * After moving
 */
function dragOnEnd() {
    this.x += parseInt(this.dx) || 0; // current x
    this.y += parseInt(this.dy) || 0; //current y
    this.dx = 0; //Reset transform
    this.dy = 0;
    this.currentTransform = this.transform(); // Save current element's position
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