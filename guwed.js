var DEFAULT_INPUT_SIZE = "50px"
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
   this.value = function() { return this.dom.val(); }
}

function createInputbox(parent) {
    var inputHtml = $('<textarea/>', {class: "gw-input", rows: "1"});
    var elem = new StackElement(inputHtml);
    var inputFakeHtml = $('<span/>', {class: "gw-input-fake", "id": "gw-input-fake-"+elem.id});
    elem.fake = inputFakeHtml;
    gwStack.addElem(elem);

    parent.append(inputHtml);
    parent.append(inputFakeHtml);

    inputHtml.css("font-size", DEFAULT_INPUT_SIZE);
    console.log("size: "+inputHtml.css("font-size"));
    inputFakeHtml.css("font-size", inputHtml.css("font-size"));

    return elem;
}

function createPower() {
    //var elem = newStackElem();
}

function elemFromDom(dom) {
    domId = dom.attr("id");
    lastDash = domId.lastIndexOf("-");
    id = parseInt(domId.substr(lastDash+1, domId.length-(lastDash+1)));
    return gwStack[getStackAttr(id)];
}

function inputUpdateWidth(elem) {
    console.log("update");
    var DEFAULT_WIDTH = "7px";
    if (elem.value().length == 0) {
        elem.dom.css("width", DEFAULT_WIDTH);
    }
    else {
        console.log(elem.fake.css("width"));
        elem.dom.css("width", elem.fake.css("width"));
    }
}

function inputHandler() {
    $(".gw-input").keyup(function(e) {
        switch (e.which) {
        case 54: // ^ pressed
        break;
        }

        elem = elemFromDom($(e.target));
        elem.fake.html(elem.dom.val());
        inputUpdateWidth(elem);
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

        inputHandler();
    });
}
