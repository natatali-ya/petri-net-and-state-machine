function addStartState(key, x, y, name) {
    var state = paper.circle(x, y, STATE_RADIUS).attr({ fill: "#FFF", stroke: "#000" });
    state.options = getOptions(x, y, key, name);
    state.click(nodeClick);
    state.drag(dragOnMove, dragOnStart, dragOnEnd);
    startState[key] = state;
    return state;
}

function addUsualState(key, x, y, name) {
    var state = paper.circle(x, y, STATE_RADIUS).attr({ fill: "#FFF", stroke: "#000" });
    state.options = getOptions(x, y, key, name);
    usualStates[key] = state;
    state.click(nodeClick);
    state.drag(dragOnMove, dragOnStart, dragOnEnd);
    return state;
}

function addFinalState(key, x, y, name) {
    var finalState = paper.rect(x - STATE_WIDTH, y - STATE_WIDTH, 2 * STATE_WIDTH, 2 * STATE_WIDTH).attr({ fill: "#FFF", stroke: "#000" });
    finalState.options = getOptions(x, y, key, name);
    finalStates[key] = finalState;
    finalState.click(nodeClick);
    finalState.drag(dragOnMove, dragOnStart, dragOnEnd);
    return finalState;
}

function drawKey(x, y, text) {
    return paper.text(x, y, text).attr({
        "font-size": 14,
        "font-family": "Times New Roman"
    });
}

function drawName(x, y, text) {
    return paper.text(x, y - STATE_RADIUS - 2 * OFFSET, text).attr({
        fill: "blue",
        "font-size": 14,
        "font-family": "Times New Roman"
    });
}

function getOptions(x, y, key, name) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.key = key;
    obj.name = name;
    obj.captionKey = drawKey(x, y, key);
    if (name) {
        obj.captionName = drawName(x, y, name);
    }
    obj.dx = 0; // transform coordinates
    obj.dy = 0;
    return obj;
}

function nodeClick() {
    if (selected) {
        clearSelection();
    }
    var selectionDash;
    var selectionAttr = { "stroke": "#808080", "stroke-dasharray": "- "};
    var x = this.options.x;
    var y = this.options.y;
    switch (this.type) {
        case "circle":   
            selectionDash = paper.rect(x - STATE_RADIUS, y - STATE_RADIUS, 2 * STATE_RADIUS, 2 * STATE_RADIUS).attr(selectionAttr).toBack();
            break;
        case "rect":
            selectionDash = paper.rect(x - STATE_WIDTH - OFFSET, y - STATE_WIDTH - OFFSET, 2 * STATE_WIDTH + 2 * OFFSET, 2 * STATE_WIDTH + 2 * OFFSET).attr(selectionAttr).toBack();
            break;
    }
    selected = paper.set();
    selected.push(selectionDash);
    selected.node = this;
}

function dragOnMove(dx, dy, x, y, e) {
    //var self = this.options;
    if (!e.ctrlKey) {
        this.options.dx = dx;
        this.options.dy = dy;
        this.transform(this.currentTransform + "t" + dx + ',' + dy); // moving from Raphael documentation
        this.options.captionKey.remove();
        this.options.captionKey = drawKey(this.options.x + dx, this.options.y + dy, this.options.key); // redraw key
        if (this.options.name) { // redraw name for transition
            this.options.captionName.remove();
            this.options.captionName = drawName(this.options.x + dx, this.options.y + dy, this.options.name);
        }
        //redrawArrows(this, this.x + dx, this.y + dy);
    } else {
        // if (tempArrow.path != null) tempArrow.path.remove();
        // if (Math.abs(tempArrow.x - this.x + dx) > PLACE_RADIUS) {
        //     tempArrow.path = paper.path("M" + tempArrow.x + "," + tempArrow.y + "L" + (this.x + dx) + "," + (this.y + dy)).attr({ "stroke": "black", "stroke-width": 2, "stroke-dasharray": "- ", "arrow-end": "block-midium-long" });
        //     tempArrowActive = true;
        // }
    }
}

function dragOnStart(x, y, e) {
    // if(e.ctrlKey) {
    //     tempArrow.x = this.x;
    //     tempArrow.y = this.y;
    //     tempArrow.from = this;
    // } else {
        this.currentTransform = this.transform(); // Save current element's position
        clearSelection();
    // }
}

function dragOnEnd(e) {
    if (!e.ctrlKey) {
        this.options.x += parseInt(this.options.dx) || 0; // current x
        this.options.y += parseInt(this.options.dy) || 0; //current y
        this.options.dx = 0; //Reset transform
        this.options.dy = 0;
        this.currentTransform = this.transform(); // Save current element's position
    }
}

function removeSelected() {
    if (!selected) return;
    var node = selected.node;
    var key = node.options.key;
    if (node.options.key == KEY_START) {
        delete startState[key];
    } else {
        var sign = key[0];
        if (sign == 'q') {
            delete usualStates[key];
        } else {
            delete finalStates[key];
        }
    }
    removeNode(node);
    clearSelection();
}

function removeNode(node) {
    // var key = selected.node.key;
    // for (var i = arrows.length - 1; i >= 0; i--) {
    //     if (arrows[i].path.from.key === key || arrows[i].path.to.key === key) {
    //         if (arrows[i].path.text) {
    //             arrows[i].path.text.remove();
    //         }
    //         arrows[i].path.remove();
    //         arrows.splice(i, 1);
    //     }
    // }
    node.options.captionKey.remove();
    if (node.options.name) {
        node.options.captionName.remove();
    }
    node.remove();
}

function resetStateMachine() {
    startState = {};
    usualStates = {};
    finalStates = {};
    arrows = [];
    selected = null;
}