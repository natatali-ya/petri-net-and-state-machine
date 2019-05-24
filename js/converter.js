function covertSmToPn(states, arrows) {
    var pNet = { "places": [], "transitions": [], "arrows": [] };

    for (var key in states) {
        var item = states[key].options;
        var token = item.key === KEY_START ? 1 : 0;
        pNet.places.push("p" + item.key.slice(1) + "," + item.x + "," + item.y + "," + token);
    }
    
    for (var key in arrows) {
        var item = arrows[key].path;
        var index = "t" + pNet.transitions.length;
        var centerCoords = calcArrowTextCoordinates(item.from.options.x, item.from.options.y, item.to.options.x, item.to.options.y, 0);
        if (item.from.options.key === item.to.options.key) {
            centerCoords.x += 100;
        }
        pNet.transitions.push(index + "," + centerCoords.x + "," + centerCoords.y + "," + item.text);
        pNet.arrows.push("p" + item.from.options.key.slice(1) + "," + index + "," + 1);
        pNet.arrows.push(index + "," + "p" + item.to.options.key.slice(1) + "," + 1);
    }
    return JSON.stringify(pNet);
}