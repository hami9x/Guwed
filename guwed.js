var DEFAULT_FONT_SIZE = "50px"
var SPACE_FOR_CURSOR = 2;

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

function createPower(box, powerParent) {
    ppFontSize = powerParent.css("font-size");
    ppFontSize = parseInt(ppFontSize.substr(0, ppFontSize.length-2));
    newFontSize = Math.round(ppFontSize/(3/2.2));
    return createInputbox(box, newFontSize);
}

function elemFromDom(dom) {
    domId = dom.attr("id");
    lastDash = domId.lastIndexOf("-");
    id = parseInt(domId.substr(lastDash+1, domId.length-(lastDash+1)));
    return gwStack[getStackAttr(id)];
}

function inputUpdateWidth(elem, addSpaceForCursor) {
    spaceForCursor = addSpaceForCursor ? SPACE_FOR_CURSOR : 0;
    //console.log("inputupdate: "+elem.dom.html()+": "+(elem.fake.width()+spaceForCursor));
    elem.dom.width(elem.fake.width()+spaceForCursor);
}

function inputHandler(box) {
    $(document).on("keyup", ".gw-input", function(e) {
        target = $(e.target);
        var content = target.html();
        var addSpaceForCursor = true;
        switch(content[content.length-1]) {
        case "^":
            content = content.substr(0, content.length-1);
            target.html(content);
            newInput = createPower(box, target);
            newInput.dom.focus();
            addSpaceForCursor = false;
        break;
        }

        elem = elemFromDom(target);
        elem.fake.html(elem.dom.html());
        inputUpdateWidth(elem, addSpaceForCursor);
    });
}

function focusHandler() {
    function adjustSpaceForCursor(target, incOrDec) {
        target = $(target);
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
        firstInput = createInputbox(wrapperHtml);

        //Create the wrap box
        var box = $("#"+domId);
        wrapperHtml.append(firstInput.dom);
        box.append(wrapperHtml);
        inputHandler(wrapperHtml);
        focusHandler();
    });
}
