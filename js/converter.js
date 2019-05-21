function covertSmToPn(startState, usualStates, finalStates, arrows) {
    var pNet = { "places": [], "transitions": [], "arrows": [] };
    var compliances = {};

    for (var key in startState) {
        var item = startState[key].options;
        compliances[key] = "p" + pNet.places.length;
        pNet.places.push("p" + pNet.places.length + "," + item.x + "," + item.y + "," + 1);
    }

    for (var key in usualStates) {
        var item = usualStates[key].options;
        compliances[key] = "p" + pNet.places.length;
        pNet.places.push("p" + pNet.places.length + "," + item.x + "," + item.y + "," + 0);
    }
    for (var key in finalStates) {
        var item = finalStates[key].options;
        compliances[key] = "p" + pNet.places.length;
        pNet.places.push("p" + pNet.places.length + "," + item.x + "," + item.y + "," + 0);
    }
    for (var key in arrows) {
        var item = arrows[key].path;
        var index = "t" + pNet.transitions.length;
        var centerCoords = calcArrowTextCoordinates(item.from.options.x, item.from.options.y, item.to.options.x, item.to.options.y, 0);
        if (item.from.options.key === item.to.options.key) {
            centerCoords.x += 100;
        }
        pNet.transitions.push(index + "," + centerCoords.x + "," + centerCoords.y + "," + item.text);
        pNet.arrows.push(compliances[item.from.options.key] + "," + index + "," + 1);
        pNet.arrows.push(index + "," + compliances[item.to.options.key] + "," + 1);
    }
    return JSON.stringify(pNet);
}