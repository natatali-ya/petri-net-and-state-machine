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

function getDataFile(inputFile, secondFile) {
    var file = inputFile.prop('files')[0];
    if (!file) {
        return;
    }
    var sm;
    var reader = new FileReader();
    reader.onload = function(e) {
        var result = JSON.parse(e.target.result);
        var render2 = new FileReader();
        render2.onload = function(e) {
            switch (operation) {
                case "1": // additions
                    sm = getAddition(result);
                    break;
                case "2": // union
                    sm = getUnion(firstSM, secondSM);
                    break;
                case "3": // intersection
                    sm = getIntersection(firstSM, secondSM);
                    break;
            }
            localStorage.setItem("sm", JSON.stringify(sm));
            window.open('StateMachine.html');
        }
        render2.readAsText(file);
    }
    reader.readAsText(file);
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
    var additionSm = {"startState":[],"usualStates":[],"finalStates":[],"arrows":[]};
    sm.startState.forEach(function(item) {
        var arr = item.split(",");
        additionSm.startState.push(arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + "," + !arr[4]);
    });

    sm.usualStates.forEach(function(item) {
        var arr = item.split(",");
        additionSm.finalStates.push("f" + arr[0].slice(1) + "," + arr[1] + "," + arr[2]+ "," + arr[3]);
    });

    sm.finalStates.forEach(function(item) {
        var arr = item.split(",");
        additionSm.usualStates.push("q" + arr[0].slice(1) + "," + arr[1] + "," + arr[2] + "," + arr[3]);
    });

    sm.arrows.forEach(function(item) {
        var arr = item.split(",");
        var key2 = arr[1] !== KEY_START ? (arr[1][0] === 'q' ? 'f' + arr[1].slice(1) : 'q' + arr[1].slice(1)) : KEY_START; 
        var key1 = arr[0] !== KEY_START ? (arr[0][0] === 'q' ? 'f' + arr[0].slice(1) : 'q' + arr[0].slice(1)) : KEY_START;
        additionSm.arrows.push(key1 + "," + key2 + "," + arr[2]);
    });

    return additionSm;    
}