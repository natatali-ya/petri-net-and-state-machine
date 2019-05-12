/**
 * GLOBAL INITIALIZATION AREA
 */
var canvas = document.getElementById("canvas");

// Creates canvas in container with id "canvas"
var paper = new Raphael("canvas");

// Main elements of the Petri net
var places = {};
var transitions = {};
var arrows = [];
var selected = null;

var tempArrow = { from: null, x: 0, y: 0, path: null };
var tempArrowActive = false;

// constants
var PLACE_RADIUS = 30;
var TOKEN_RADIUS = 5;
var TRANSITION_HEIGHT = 60;
var TRANSITION_WIDTH = 20;
var OFFSET = 5;
var SELECTION_ARROW_HEIGHT = 8;
/**
 * Handlers for clicking outside the element. Clearing selection
 */
canvas.addEventListener('click', function(e) {
    if (e.target.nodeName == "svg") {
        clearSelection();
    }
});

canvas.addEventListener('mouseup', function(e) {
    if (e.target.nodeName == "svg" && e.ctrlKey && tempArrowActive) {
        clearSelection();
        tempArrow.path.remove();
        tempArrowActive = false;
    }
});
/**
 * Handlers for clicking the settings buttons
 */
btnOpen.addEventListener("click", function() {
    //TODO
});

btnSave.addEventListener("click", function() {
    //TODO
});

btnRun.addEventListener("click", function() {
    //TODO
});

btnStop.addEventListener("click", function() {
    //TODO
});

btnAddPlace.addEventListener("click", function() {
    addPlace("p" + nextIndex(places), 50, 50, 0);
});

btnAddTransition.addEventListener("click", function() {
    var name = document.getElementById("transitionName").value;
    addTransition("t" + nextIndex(transitions), 50, 50, name);
});

btnAddToken.addEventListener("click", function() {
    if (selected) {
        addToken(places[selected.node.key]);
    }
});

btnRemToken.addEventListener("click", function() {
    if (selected) {
        removeToken(places[selected.node.key]);
    }
});

btnRemove.addEventListener("click", function() {
    removeSelected();
});

// Clear canvas and old information about Petri net
btnClearAll.addEventListener("click", function() {
    ResetPetriNet();
    paper.clear();
});