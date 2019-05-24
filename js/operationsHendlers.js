var firstSM = {};
var secondSM = {};
var operation = null;
var firstFile;
var secondFile;

KEY_START = "q0";

$("#sm-form").on("submit", function (event) {
    if (!event.isDefaultPrevented()) {
        event.preventDefault();
        var sm;
        localStorage.clear();
        getDataFile(firstFile, secondFile);
        // switch (operation) {
        //     case "1": // additions
        //         sm = getAddition(firstSM);
        //         break;
        //     case "2": // union
        //         sm = getUnion(firstSM, secondSM);
        //         break;
        //     case "3": // intersection
        //         sm = getIntersection(firstSM, secondSM);
        //         break;
        // }
        //console.log(sm);
        // Запишем в localStorage с ключём object
        // localStorage.setItem("sm", sm);
        // window.open('StateMachine.html');
    }
});

function getDataFile(firstFile, secondFile) {
    var first = firstFile.prop('files')[0];
    var second = secondFile.prop('files')[0];
    if (!first || !second) {
        return;
    }
    var sm;
    var reader = new FileReader();
    reader.onload = function(e) {
        var result1 = JSON.parse(e.target.result);
        var render2 = new FileReader();
        render2.onload = function(e) {
            var result2 = JSON.parse(e.target.result);
            switch (operation) {
                case "1": // additions
                    sm = getAddition(result1);
                    break;
                case "2": // union
                    sm = getUnion(result1, result2);
                    break;
                case "3": // intersection
                    sm = getIntersection(result1, result2);
                    break;
            }
            localStorage.setItem("sm", JSON.stringify(sm));
            window.open('StateMachine.html');
        }
        render2.readAsText(second);
    }
    reader.readAsText(first);
}

$('#firstSM').on('change',function(){
    //get the file name
    var fileName = $(this).val();
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
    firstFile = $(this);
    //getDataFile($(this), 1);
});

$('#secondSM').on('change',function(){
    //get the file name
    var fileName = $(this).val();
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
    secondFile = $(this);
    //getDataFile($(this), 2);
});

$('#operation').on('change',function(){
    operation = $(this).val();
});

function getAddition(sm) {
    var additionSm = {"states":[],"arrows":[]};
    sm.states.forEach(function(item) {
        var arr = item.split(",");
        var isFinal = (arr[4] === 'true');
        additionSm.states.push(arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + "," + !isFinal);
    });

    additionSm.arrows = sm.arrows;

    return additionSm;    
}

function getUnion(sm1, sm2) {
    var union = {"states": {},"arrows": {}};
    var sm1 = convertToObj(sm1);
    var sm2 = convertToObj(sm2);
    var alphabet = {};

    for (var key in sm1.arrows) {
        alphabet[sm1.arrows[key].text] = 1;
    }
    for (var key in sm2.arrows) {
        alphabet[sm2.arrows[key].text] = 1;
    }
    
    // create new start state
    var start1 = sm1.states[KEY_START];
    var start2 = sm2.states[KEY_START];
    if (!isEmpty(start1) && !isEmpty(start2)) {
        var key = KEY_START + "," + KEY_START;
        var isFinal = start1.isFinal || start2.isFinal;
        var name = start1.name + " " + start2.name;
        var x = start1.x;
        var y = start1.y;
        union.states[key] = { 
            key: key,
            keyArr: [KEY_START, KEY_START],
            x: x, 
            y: y, 
            name: name, 
            isFinal: isFinal 
        };
    } else if (!isEmpty(start1)) {
        union.states.push({
            key: start1.key + ",",
            keyArr: [start1.key,],
            x: start1.x,
            y: start1.y,
            name: start1.name,
            isFinal: start1.isFinal
        });
    } else if (!isEmpty(start2)) {
        union.states.push({
            key: "," + start2.key,
            keyArr: [,start2.key],
            x: start2.x,
            y: start2.y,
            name: start2.name,
            isFinal: start2.isFinal
        });
    }
    unionsArr = [{ 
        key: key,
        keyArr: [KEY_START, KEY_START],
        x: x, 
        y: y, 
        name: name, 
        isFinal: isFinal 
    }];
    var len = Object.keys(union.states).length;
    for (var i = 0; i < len; i++) {
        var key = Object.keys(union.states)[i];
        for (var symb in alphabet) {
            var keyNew;
            var isFinal = false;;
            var name;
            var x;
            var y;
            var keyArrNew = [];
            for (var arrow1 in sm1.arrows) {
                if (sm1.arrows[arrow1].from === union.states[key].keyArr[0] && sm1.arrows[arrow1].text === symb) {
                    x = sm1.states[sm1.arrows[arrow1].to].x;
                    y = sm1.states[sm1.arrows[arrow1].to].y;
                    isFinal = sm1.states[sm1.arrows[arrow1].to].isFinal;
                    keyNew = sm1.states[sm1.arrows[arrow1].to].key;
                    name = sm1.states[sm1.arrows[arrow1].to].name;
                    keyArrNew[0] = keyNew;
                }
            }
            keyNew += ",";
            name += " ";
            for (var arrow2 in sm2.arrows) {
                if (sm2.arrows[arrow2].from === union.states[key].keyArr[1] && sm2.arrows[arrow2].text === symb) {
                    x = x || sm2.states[sm2.arrows[arrow2].to].x;
                    y = y || sm2.states[sm2.arrows[arrow2].to].y;
                    isFinal = isFinal || sm2.states[sm2.arrows[arrow2].to].isFinal;
                    keyNew += sm2.states[sm2.arrows[arrow2].to].key;
                    name += sm2.states[sm2.arrows[arrow2].to].name;
                    keyArrNew[1] = sm2.states[sm2.arrows[arrow2].to].key;
                }
            }
            newState = {
                key: keyNew,
                x: x,
                y: y,
                name: name,
                isFinal: isFinal,
                keyArr: keyArrNew
            }
            unionsArr.push(newState);
            union.states[keyNew] = newState;
            union.arrows[key + "," + keyNew] = {
                from: key,
                to: keyNew,
                text: symb
            }
            len = Object.keys(union.states).length;
        }
    }

    console.log(union);

    return union;
}

function convertToObj(sm) {
    var newSm = { "states" : {}, "arrows": {} };
    sm.states.forEach(function(item) {
        state = item.split(",");
        newSm.states[state[0]] = {
            key: state[0],
            x: state[1],
            y: state[2],
            name: state[3],
            isFinal: state[4]
        } 
    });
    sm.arrows.forEach(function(item) {
        arrow = item.split(",");
        newSm.arrows[arrow[0] + "," + arrow[1]] = {
            from: arrow[0],
            to: arrow[1],
            text: arrow[2]
        }
    });

    return newSm;
}