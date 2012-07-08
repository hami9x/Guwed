var DEFAULT_FONT_SIZE = 50
var SPACE_FOR_CURSOR = 5;
var INPUTBOX_DEFAULT_WIDTH = 3;

var gwStack = new Object();
gwStack.length = 0;
gwStack.addElem = function(elem) {
    gwStack[getStackAttr(elem.id)] = elem;
    gwStack.length++;
}

function getStackAttr(id) {
    return "number"+id.toString();
}

function StackElement(domElem) {
   this.id = gwStack.length+1;
   domElem.attr("id", "gw-input-"+this.id);
   this.dom = domElem;
}

function createInputbox(parent, fontSize) {
    var inputHtml = $('<span/>', {class: "gw-input", contenteditable: "true"});
    var elem = new StackElement(inputHtml);
    gwStack.addElem(elem);

    fontSize = fontSize || DEFAULT_FONT_SIZE;
    inputHtml.css("font-size", fontSize.toString()+"px");

    parent.append(inputHtml);

    ///Measure the height
    var fakeInputHtml = $('<span/>', {class: "gw-input-fake", id: "gw-input-fake-"+elem.id.toString(),
        style: "font-size: "+fontSize.toString()+"px"});
    fakeInputHtml.html("H");
    fakeInputHtml.ready(function() {
    parent.append(fakeInputHtml);
        //console.log(fakeInputHtml.css("height"));
        inputHtml.css("height", fakeInputHtml.css("height"));
        fakeInputHtml.html("");
    });
    elem.fake = fakeInputHtml;
    return elem;
}

function createPower(box, powerParent, elemBefore) {
    var newFontSize = 0;
    if (typeof powerParent === "undefined") {
        newFontSize = undefined;
    } else {
        var ppFontSize = powerParent.css("font-size");
        ppFontSize = parseInt(ppFontSize.substr(0, ppFontSize.length-2));
        newFontSize = Math.round(ppFontSize/(3/2.2));
    }
    elem = createInputbox(box, newFontSize);
    if (typeof powerParent !== "undefined") {
        if (typeof elemBefore !== "undefined") {
            elem.dom.insertAfter(elemBefore);
        }
        else {
            elem.dom.insertAfter(powerParent);
        }
    }
    elem.parent = powerParent;
    return elem;
}

function elemFromDom(dom) {
    var domId = dom.attr("id");
    var lastDash = domId.lastIndexOf("-");
    var id = parseInt(domId.substr(lastDash+1, domId.length-(lastDash+1)));
    return gwStack[getStackAttr(id)];
}

function inputUpdateWidth(elem, addSpaceForCursor) {
    content = elem.dom.html();
    elem.fake.html(elem.dom.html());
    if (content.length > 0) {
        var spaceForCursor = addSpaceForCursor ? SPACE_FOR_CURSOR : 0;
        //console.log("inputupdate: "+elem.dom.html()+": "+(elem.fake.width()+spaceForCursor));
        elem.dom.width(elem.fake.width()+spaceForCursor);
    } else {
        elem.dom.width(INPUTBOX_DEFAULT_WIDTH.toString()+"px");
    }
}

function inputHandler(box) {
    var processStack = Array();

    $(document).on("keyup", ".gw-input", function(e) {
        var target = $(e.target);
        var content = target.html();
        var addSpaceForCursor = true;
        var elem = elemFromDom(target);
        while (processStack.length > 0) {
            addSpaceForCursor = false;
            key = processStack.pop();
            strs = content.split(key);
            if (key == "^") {
                target.html(strs[0]);
                newInput = createPower(box, target);
                newInput.dom.focus();

                newInput2 = createPower(box, elem.parent, newInput.dom);
                newInput2.dom.html(strs[1]);
                inputUpdateWidth(newInput2, addSpaceForCursor);
            }
        }

        inputUpdateWidth(elem, addSpaceForCursor);
    });

    $(document).on("keypress", ".gw-input", function(e) {
        var key = String.fromCharCode(e.charCode || e.keyCode || 0);
        switch(key) {
        case "^":
            processStack.push(key);
        break;
        }
    });
}

function focusHandler() {
    function adjustSpaceForCursor(target, incOrDec) {
        var target = $(target);
        if (target.html().length > 0) {
            //console.log(target.html()+": "+(target.width()+SPACE_FOR_CURSOR*incOrDec));
            target.width(target.width()+SPACE_FOR_CURSOR*incOrDec);
        }
    }
    $(document).on("focusin", ".gw-input", function(e) {
        //console.log("focusin"+$(e.target).html());
        adjustSpaceForCursor(e.target, 1);
    });
    $(document).on("focusout", ".gw-input", function(e) {
        //console.log("focusout"+$(e.target).html());
        adjustSpaceForCursor(e.target, -1);
    });

}

function jqInput(id) {
    return $("#gw-input-"+id.toString());
}

//>>> RUN <<<//
function renderGuwed(domId) {
    $(document).ready(function() {
        var wrapperHtml = $('<div/>', {class: "gw-wrapper"});

        //Initial input box
        var firstInput = createInputbox(wrapperHtml);

        //Create the wrap box
        var box = $("#"+domId);
        wrapperHtml.append(firstInput.dom);
        box.append(wrapperHtml);
        inputHandler(wrapperHtml);
        focusHandler();
    });
}
