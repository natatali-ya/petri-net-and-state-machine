function covertSmToPn(states, arrows) {
    var pNet = { "places": [], "transitions": [], "arrows": [] };
    var matching = {};
    for (var key in states) {
        var item = states[key].options;
        var token = item.key === (KEY_START + "-" + KEY_START || KEY_START + "-" || "-" + KEY_STAR) ? 1 : 0; 
        var itemKey = item.key.split("");
        for (var i = 0; i < itemKey.length; i++) {
            if (itemKey[i] == 'q') {
                itemKey[i] = 'p';
            }
        }
        var newKey = itemKey.join("");
        matching[item.key] = newKey;
        pNet.places.push(newKey + "," + item.x + "," + item.y + "," + token);
    }
    
    for (var key in arrows) {
        var item = arrows[key].path;
        var index = "t" + pNet.transitions.length;
        var centerCoords = calcArrowTextCoordinates(item.from.options.x, item.from.options.y, item.to.options.x, item.to.options.y, 0);
        if (item.from.options.key === item.to.options.key) {
            centerCoords.x += 100;
        }
        pNet.transitions.push(index + "," + centerCoords.x + "," + centerCoords.y + "," + item.text);
        pNet.arrows.push(matching[item.from.options.key] + "," + index + "," + 1);
        pNet.arrows.push(index + "," + matching[item.to.options.key] + "," + 1);

    }
    return JSON.stringify(pNet);
}