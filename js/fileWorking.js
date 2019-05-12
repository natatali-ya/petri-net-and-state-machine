/** 
 * -------------------------------
 *         SAVE TO FILE
 * -------------------------------
 */

 /**
  * Saving petri net to file
  * @param {String} file - file's name to save
  */
function saveToFile(file) {
    var text = serializePnet(places, transitions, arrows);
    downloadToFile(file, text);
}

/**
 * Convert to string in JSON format
 * @param {Object} places - petri net's places
 * @param {Object} transitions - petri net's transitions
 * @param {Object} arrows - petri net's arrows
 */
function serializePnet(places, transitions, arrows) {
    var pNet = { places:[], transitions:[], arrows:[] };
    Object.keys(places).forEach(function(key) {
        var place = places[key];
        pNet.places.push(place.key + "," + place.x + "," + place.y + "," + place.tokens.length);
    });
    Object.keys(transitions).forEach(function(key) {
        var transition = transitions[key];
        pNet.transitions.push(transition.key + "," + transition.x + "," + transition.y + "," + transition.tname);
    });
    arrows.forEach(function(item) {
        var arrow = item.path;
        pNet.arrows.push(arrow.from.key + "," + arrow.to.key + "," + arrow.count);
    });
    return JSON.stringify(pNet);
}

/**
 * Download petri net to file
 * @param {String} file - file's name to save
 * @param {String} text - string in JSON format represented petri net
 */
function downloadToFile(file, text) {
    var link = document.createElement("a");
    link.setAttribute("download", file);
    link.href = createFile(text);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(function() {
        var event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });
}

/**
 * Create file with given text
 * @param {String} text - string in JSON format
 */
function createFile(text) {
    var data = new Blob([text], { type: 'text/plain' });
    
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    url = window.URL.createObjectURL(data);
    return url; // returns a URL you can use as a href
}

/** 
 * -------------------------------
 *       DOWNLOAD FROM FILE
 * -------------------------------
 */

 /**
  * Get new file and handles it
  */
function processNewFile() {
    var file = document.getElementById("fileinput").files[0];;
    if (!file) {
        return;
    }
    readFromFile(file, function(e) {
        try {
            var pNet = JSON.parse(e.target.result);
            deserializePnet(pNet);
        }
        catch(err) {
            console.log(err.message);
        }
    });
}

/**
 * Read data from given file
 * @param {Object} file - downloaded file
 * @param {Object} handler - handler's function for file
 */
function readFromFile(file, handler) {
    var reader = new FileReader();
    reader.onload = handler;
    try {
        reader.readAsText(file);
    }
    catch (err) {
        console.log(err.message);
    }
}

/**
 * Convert and draw to string petri net from JSON format
 * @param {String} pNet - string in JSON format represented petri net
 */
function deserializePnet(pNet) {
    paper.clear();
    resetPetriNet();
    pNet.places.forEach(function(item) {
        var arr = item.split(",");
        addPlace(arr[0], +arr[1], +arr[2], +arr[3]);
    });
    pNet.transitions.forEach(function(item) {
        var arr = item.split(",");
        addTransition(arr[0], +arr[1], +arr[2], arr[3]);
    });
    pNet.arrows.forEach(function(item) {
        var arr = item.split(",");
        addArrow(getByKey(arr[0]), getByKey(arr[1]), +arr[2]);
    });
    console.log(pNet);
}

/**
 * Get place/transition by given key
 * @param {String} key - key looks like "p1" or "t5"
 */
function getByKey(key) {
    if (key.charAt(0) == "p")
        return places[key];
    if (key.charAt(0) == "t")
        return transitions[key];
    return null;
}
