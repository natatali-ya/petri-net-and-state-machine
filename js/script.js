/**
 * GLOBAL INITIALIZATION AREA
 */
var canvas = document.getElementById("canvas");
var width = window.innerWidth;
var height = window.innerHeight;

// Creates canvas in container with id "canvas"
var paper = new Raphael("canvas", width, height);

// Main elements of the Petri net
var places = {};
var transitions = {};
var arrows = [];
var selected = null;

// helpers
var tempArrow = { from: null, x: 0, y: 0, path: null };
var tempArrowActive = false;
var textFile = null; // need to manually revoke the object URL to avoid memory leaks

// constants
var PLACE_RADIUS = 30;
var TOKEN_RADIUS = 5;
var TRANSITION_HEIGHT = 60;
var TRANSITION_WIDTH = 20;
var OFFSET = 5;
var SELECTION_ARROW_HEIGHT = 8;
var DOUBLE_OFFSET = 6;

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
    saveToFile("petriNet.txt", "PN");
});

/**
 * Handler for clicking the Add place button
 */
btnAddPlace.addEventListener("click", function() {
    addPlace("p" + nextIndex(places), 50, 50, 0);
});

/**
 * Handler for clicking the Add transition
 */
btnAddTransition.addEventListener("click", function() {
    var name = document.getElementById("transitionName").value;
    addTransition("t" + nextIndex(transitions), 50, 50, name);
});

/**
 * Handler for clicking the Add token button
 */
btnAddToken.addEventListener("click", function() {
    if (selected) {
        addToken(places[selected.node.key]);
    }
});

/**
 * Handler for clicking the Remove token button
 */
btnRemToken.addEventListener("click", function() {
    if (selected) {
        removeToken(places[selected.node.key]);
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
 * Clear canvas and old information about Petri net
 */
btnClearAll.addEventListener("click", function() {
    resetPetriNet();
    paper.clear();
});

function loadPage() {
    var obj = localStorage.getItem("object");
    if (obj) {
        deserializePnet(JSON.parse(obj));
    }
    localStorage.clear();
}