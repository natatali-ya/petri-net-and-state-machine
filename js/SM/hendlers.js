/**
 * GLOBAL INITIALIZATION AREA STATE MACHINE
 */
var canvas = document.getElementById("canvas");
var width = window.innerWidth;
var height = window.innerHeight;

// Creates canvas in container with id "canvas"
var paper = new Raphael("canvas", width, height);

// Main elements of the Petri net
var startState = {};
var usualStates = {};
var finalStates = {};
var arrows = [];
var selected = null;

// helpers
var tempArrow = { from: null, x: 0, y: 0, path: null };
var tempArrowActive = false;
var textFile = null; // need to manually revoke the object URL to avoid memory leaks

// constants
var STATE_RADIUS = 30;
var STATE_WIDTH = 25;
var OFFSET = 5;
var KEY_START = "q0";


/**
 * Clicking outside the element. Clearing selection
 */
canvas.addEventListener('click', function(e) {
    if (e.target.nodeName == "svg") {
        clearSelection();
    }
});

/**
 * Mouse up outside the element with ctrl key while drawing new arrow
 */
canvas.addEventListener('mouseup', function(e) {
    if (e.target.nodeName == "svg" && e.ctrlKey && tempArrowActive) {
        clearSelection();
        tempArrow.path.remove();
        tempArrowActive = false;
    }
});

/**
 * Handler for clicking the Open button
 */
btnOpen.addEventListener("click", function() {
    document.getElementById('fileinput').click();
});

/**
 * Handler for clicking the Save button
 */
btnSave.addEventListener("click", function() {
    saveToFile("stateMachine.txt", "SM");
});

/**
 * Handler for clicking the Add state button
 */
btnAddState.addEventListener("click", function() {
    var stateName = document.getElementById("stateName").value;
    var start = document.getElementById("startState");
    var usual = document.getElementById("usualState");
    var final = document.getElementById("finalState");
    if (start.checked) {
        if (!isEmpty(startState)) {
            var start = startState[KEY_START];
            start.options.captionKey.remove();
            if (start.options.name) {
                start.options.captionName.remove();
            }
            start.remove();
            delete start;
        }
        addStartState(KEY_START, 100, 100, stateName);
    } else if (usual.checked) {
        addUsualState("q" + (nextIndex(usualStates)), 50, 50, stateName);
        
    } else if (final.checked) {
        addFinalState("f" + nextIndex(finalStates), 50, 50, stateName);
    }
});

/**
 * Handler for clicking the Remove (selected) button
 */
btnRemove.addEventListener("click", function() {
    removeSelected();
});

/**
 * Handler for clicking the Clear all button
 * Clear canvas and old information about State Machine
 */
btnClearAll.addEventListener("click", function() {
    resetStateMachine();
    paper.clear();
});
