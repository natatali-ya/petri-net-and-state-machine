function addState(key, x, y, name, isFinal) {
    if (key === KEY_START && states[KEY_START]) return;
    var state;
    if (typeof(isFinal) == 'string') {
        isFinal = (isFinal === 'true');
    } 
    if (isFinal) {
        state = paper.rect(x - STATE_WIDTH, y - STATE_WIDTH, 2 * STATE_WIDTH, 2 * STATE_WIDTH).attr({ fill: "#FFF", stroke: "#000" });
    } else {
        state = paper.circle(x, y, STATE_RADIUS).attr({ fill: "#FFF", stroke: "#000" });
    }
    state.options = getOptions(x, y, key, name);
    state.options.isFinal = isFinal;
    state.click(nodeClick);
    state.drag(dragOnMove, dragOnStart, dragOnEnd);
    state.dblclick(dblClick);
    state.mouseup(nodeMouseUp);

    states[key] = state;
}

function addArrow(node1, node2, text) {
    var arrow;
    var node1opt = node1.options;
    var node2opt = node2.options;
    if (node1opt.key != node2opt.key) {  // diffent nodes
        arrow = arrowExists(node1opt.key, node2opt.key);
        if (!isEmpty(arrow)) { // if such arrow exists
            $('#toast-arrow').toast('show');
        } else { // else new arrow        
            if (checkDistance(node1opt.x, node2opt.x, node1opt.y, node2opt.y, STATE_RADIUS)) {
                backArrow = checkBackRelation(node1opt.key, node2opt.key);
                if (!isEmpty(backArrow)) {
                    var textExistsArrow = backArrow.path.text;
                    if (textExistsArrow) {
                        backArrow.path.textCaption.remove();
                    }
                    backArrow.path.remove();
                    backArrow.path = addArrowPath(node2opt.x, node2opt.y, node1opt.x, node1opt.y, DOUBLE_OFFSET);
                    backArrow.path.text = textExistsArrow;
                    backArrow.path.from = node2;
                    backArrow.path.to = node1;
                    backArrow.path.doubleOffset = DOUBLE_OFFSET;
                    backArrow.path.keys = [node2opt.key, node1opt.key];
                    if (textExistsArrow) {
                        var coordinates = calcArrowTextCoordinates(node1opt.x, node1opt.y, node2opt.x, node2opt.y, DOUBLE_OFFSET);
                        backArrow.path.textCaption = drawArrowText(textExistsArrow, coordinates.x, coordinates.y);
                    }
                    backArrow.path.click(nodeClick);

                    arrow.path = addArrowPath(node1opt.x, node1opt.y, node2opt.x, node2opt.y, -DOUBLE_OFFSET);
                    arrow.path.text = text;
                    arrow.path.from = node1;
                    arrow.path.to = node2;
                    arrow.path.doubleOffset = -DOUBLE_OFFSET;
                    arrow.path.keys = [node1opt.key, node2opt.key];
                    if (text) {
                        var coordinates = calcArrowTextCoordinates(node1opt.x, node1opt.y, node2opt.x, node2opt.y, -DOUBLE_OFFSET);
                        arrow.path.textCaption = drawArrowText(text, coordinates.x, coordinates.y);
                    }
                    arrow.path.click(nodeClick);
                    arrows.push(arrow);
                } else {
                    arrow.path = addArrowPath(node1opt.x, node1opt.y, node2opt.x, node2opt.y, 0);
                    arrow.path.text = text;
                    arrow.path.from = node1;
                    arrow.path.to = node2;
                    arrow.path.doubleOffset = 0;
                    arrow.path.keys = [node1opt.key, node2opt.key];
                    if (arrow.path.text) {
                        var coordinates = calcArrowTextCoordinates(node1opt.x, node1opt.y, node2opt.x, node2opt.y, 6);
                        arrow.path.textCaption = drawArrowText(arrow.path.text, coordinates.x, coordinates.y);
                    }
                    arrow.path.click(nodeClick);
                    arrows.push(arrow);
                }
            } 
        }    
    } else {
        addItselfArrow(node1, text);
    }
}

function addArrowPath(xFrom, yFrom, xTo, yTo, doubleOffset) {
    var path = {};
    if (!checkDistance(xFrom, xTo, yFrom, yTo, STATE_RADIUS)) {
        path = paper.path("M" + xFrom + "," + yFrom + "L" + xFrom + "," + yFrom).attr({ "stroke": "black"}); // fictitious-empty arrow
    } else {
        var attrPath = { "stroke": "black", "stroke-width": 2, "arrow-end": "block-wide-long" };
        var offset = calcOffset(xFrom, xTo, yFrom, yTo, STATE_RADIUS);
        if (xFrom < xTo) {
            xFrom = xFrom + offset.x;
            xTo = xTo - offset.x;
        } else {
            xFrom = xFrom - offset.x;
            xTo = xTo + offset.x;
        }
        if (yFrom < yTo) {             
            yFrom = yFrom + offset.y + doubleOffset;
            yTo = yTo - offset.y + doubleOffset;
        } else {
            yFrom = yFrom - offset.y + doubleOffset;             
            yTo = yTo + offset.y + doubleOffset;
        }
        path = paper.path("M" + xFrom + "," + yFrom + "L" + xTo + "," + yTo).attr(attrPath);
    }
    return path;
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
    switch (this.type) {
        case "circle":   
            var x = this.options.x;
            var y = this.options.y;
            selectionDash = paper.rect(x - STATE_RADIUS, y - STATE_RADIUS, 2 * STATE_RADIUS, 2 * STATE_RADIUS).attr(selectionAttr).toBack();
            break;
        case "rect":
            var x = this.options.x;
            var y = this.options.y;
            selectionDash = paper.rect(x - STATE_WIDTH - OFFSET, y - STATE_WIDTH - OFFSET, 2 * STATE_WIDTH + 2 * OFFSET, 2 * STATE_WIDTH + 2 * OFFSET).attr(selectionAttr).toBack();
            break;
        case "path":
            var path = this.attr("path");
            var x1 = path[0][1];
            var y1 = path[0][2];
            var x2 = path[1][1];
            var y2 = path[1][2];
            var width = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
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

function dragOnMove(dx, dy, x, y, e) {  
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
        redrawArrows(this, this.options.x + dx, this.options.y + dy);
    } else {
        if (tempArrow.path != null) tempArrow.path.remove();
        if (Math.abs(tempArrow.x - this.options.x + dx) > STATE_RADIUS) {
            tempArrow.path = paper.path("M" + tempArrow.x + "," + tempArrow.y + "L" + (this.options.x + dx) + "," + (this.options.y + dy)).attr({ "stroke": "black", "stroke-width": 2, "stroke-dasharray": "- ", "arrow-end": "block-midium-long" });
            tempArrowActive = true;
        }
    }
}

function dragOnStart(x, y, e) {
    if(e.ctrlKey) {
        tempArrow.x = this.options.x;
        tempArrow.y = this.options.y;
        tempArrow.from = this;
    } else {
        this.currentTransform = this.transform(); // Save current element's position
        clearSelection();
    }
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

function nodeMouseUp(e) {
    if (e.ctrlKey  && tempArrowActive) {
        tempArrow.path.remove();
        var text = document.getElementById('transitionName').value;
        addArrow(tempArrow.from, this, text);
    }
}

function removeSelected() {
    if (!selected) return;
    var node = selected.node;

    switch (node.type) {
        case "circle":
        case "rect":
            var key = node.options.key;
            delete states[key];
            removeNode(node);
            break;
        case "path":
            if (node.text) {
                node.textCaption.remove();
            }
            removeArrow(node.keys[0], node.keys[1]);
            break;
    }
    clearSelection();
}

function removeNode(node) {
    var key = selected.node.options.key;
    for (var i = arrows.length - 1; i >= 0; i--) {
        if (arrows[i].path.from.options.key === key || arrows[i].path.to.options.key === key) {
            if (arrows[i].path.text) {
                arrows[i].path.text.remove();
            }
            arrows[i].path.remove();
            arrows.splice(i, 1);
        }
    }
    node.options.captionKey.remove();
    if (node.options.name) {
        node.options.captionName.remove();
    }
    node.remove();
}

function resetStateMachine() {
    states = {};
    arrows = [];
    selected = null;
}

function dblClick() {
    var text = document.getElementById('transitionName').value;
    addItselfArrow(this, text);
}

function addItselfArrow(node, text) {
    var arrow = {};
    var x = node.options.x - OFFSET;
    var y = node.options.y - STATE_RADIUS;
    arrow.path = paper.path('M' + x + ',' + y + 
        'C' + (x - INCLINE_X) + ',' + (y - INCLINE_Y) + 
        ',' + (x + INCLINE_X + 2 * OFFSET) + ',' + (y - INCLINE_Y) + 
        ',' + (x + 2 * OFFSET) + ',' + y).attr({ "stroke-width": 2, "arrow-end": "block-wide-long" });
    arrow.path.text = text;
    arrow.path.from = node;
    arrow.path.to = node;
    arrow.path.doubleOffset = 0;
    arrow.path.keys = [node.options.key, node.options.key];
    if (arrow.path.text) {
        arrow.path.textCaption = drawArrowText(arrow.path.text, x + OFFSET, y - INCLINE_Y + 2 * OFFSET);
    }
    arrow.path.click(nodeClick);
    arrows.push(arrow);
}

function redrawItselfArrow(node, text, x, y) {
    var arrow = {};
    var x = x - OFFSET;
    var y = y - STATE_RADIUS;
    arrow.path = paper.path('M' + x + ',' + y + 
        'C' + (x - INCLINE_X) + ',' + (y - INCLINE_Y) + 
        ',' + (x + INCLINE_X + 2 * OFFSET) + ',' + (y - INCLINE_Y) + 
        ',' + (x + 2 * OFFSET) + ',' + y).attr({ "stroke-width": 2, "arrow-end": "block-wide-long" });
    arrow.path.text = text;
    arrow.path.from = arrow.path.to = node;
    arrow.path.doubleOffset = 0;
    arrow.path.keys = [node.options.key, node.options.key];
    if (text) {
        arrow.path.textCaption = paper.text(x + OFFSET, y - INCLINE_Y + 2 * OFFSET, text);
    }
    arrow.path.click(nodeClick);
    return arrow.path;
}

function redrawArrows(node, x, y) {
    arrows.forEach(function(arrow) {
        if (arrow.path.from.options.key === node.options.key && arrow.path.to.options.key === node.options.key) { // arc in itself
            if (arrow.path.text) {
                arrow.path.textCaption.remove();
            }
            var text = arrow.path.text;
            arrow.path.remove();
            arrow.path = redrawItselfArrow(node, text, x, y);
        } else if (arrow.path.from.options.key == node.options.key) {
            var arrowTo = arrow.path.to;
            var arrowFrom = arrow.path.from;
            var arrowKeys = arrow.path.keys;
            var text = arrow.path.text;
            var doubleOffset = arrow.path.doubleOffset;
            if (text) {
                arrow.path.textCaption.remove();
            }
            arrow.path.remove();
            arrow.path = addArrowPath(x, y, arrowTo.options.x, arrowTo.options.y, doubleOffset);
            arrow.path.doubleOffset = doubleOffset;
            arrow.path.from = arrowFrom;
            arrow.path.to = arrowTo;
            arrow.path.keys = arrowKeys;
            arrow.path.text = text;
            if (text) {
                var coordinates = calcArrowTextCoordinates(x, y, arrowTo.options.x, arrowTo.options.y, arrow.path.doubleOffset);
                arrow.path.textCaption = drawArrowText(text, coordinates.x, coordinates.y);
            }
            if (checkDistance(x, arrowTo.options.x, y, arrowTo.options.y, STATE_RADIUS) && arrow.text) {
                arrow.captionText.remove();
            } 
            arrow.path.click(nodeClick);
        }
        else if (arrow.path.to.options.key == node.options.key) {
            var arrowTo = arrow.path.to;
            var arrowFrom = arrow.path.from;
            var text = arrow.path.text;
            var arrowKeys = arrow.path.keys;
            var doubleOffset = arrow.path.doubleOffset;
            if (text) {
                arrow.path.textCaption.remove();
            }
            arrow.path.remove();
            arrow.path = addArrowPath(arrowFrom.options.x, arrowFrom.options.y, x, y, doubleOffset);
            arrow.path.doubleOffset = doubleOffset;
            arrow.path.from = arrowFrom;
            arrow.path.to = arrowTo;
            arrow.path.keys = arrowKeys;
            arrow.path.text = text;
            if (text) {
                var coordinates = calcArrowTextCoordinates(arrowFrom.options.x, arrowFrom.options.y, x, y, arrow.path.doubleOffset);
                arrow.path.textCaption = drawArrowText(text, coordinates.x, coordinates.y);
            }
            if (checkDistance(arrowFrom.options.x, x, arrowFrom.options.y, y, STATE_RADIUS) && arrow.text) {
                arrow.captionText.remove();
            } 
            arrow.path.click(nodeClick);
        }
    });
}
