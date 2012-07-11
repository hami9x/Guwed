var DEFAULT_FONT_SIZE = "20px";
var MIN_SELECT_OFFSET = 3;
var LEFT=1; RIGHT=-1;

////////////////////////////////////////////////////////////////////
// Caret
////////////////////////////////////////////////////////////////////
function caretCreate(blinkInterval) {
    var caret = $('<span/>', {class: "gw-elem gw-caret", id: "caret"});

    caret.blinkInterval = blinkInterval;

    return caret;
}

function caretAnimShow(caret) {
    if (caret.blinking === false) return;
    caret.css("visibility", "visible");
    setTimeout(function() {
        caretAnimHide(caret);
    }, caret.blinkInterval);
}

function caretAnimHide(caret) {
    caret.css("visibility", "hidden");
    setTimeout(function() {
        caretAnimShow(caret);
    }, caret.blinkInterval);
}

function caretShow(caret) {
    if (!caret.blinking) {
        caret.blinking = true;
        caretAnimShow(caret);
    }
}

function caretHide(caret) {
    caret.blinking = false;
}

function caretMove(caret, position, elem) {
    switch (position) {
    case "after":
        caret.insertAfter(elem);
    break;
    case "before":
        caret.insertBefore(elem);
    break;
    default:
        throw('Error: parameter 2 to caretMove is not correct.')
    }
}

function isLeftOrRightHalf(mouseX, elem, fnLeft, fnRight) {
        var relOffsetX = mouseX - elem.offset().left;
        if (relOffsetX <= elem.width()/2) {
            if (fnLeft) fnLeft();
            return LEFT;
        } else {
            if (fnRight) fnRight();
            return RIGHT;
        }
}

function getRelativePos(elem1, elem2) {
    if (elem1.index() > elem2.index()) {
        return RIGHT;
    } else {
        return LEFT;
    }
}

function select(wrapper, elem, fromWhere) {
    wrapper.selection.insertAfter(elem);

    if (fromWhere == LEFT) {
        elem.appendTo(wrapper.selection);
    } else {
        elem.prependTo(wrapper.selection);
    }
}

function deselect(wrapper) {
    wrapper.selection.replaceWith(wrapper.selection.html());
    wrapper.selection = initSelection();
}

function initSelection() {
    return $('<span/>', {id: "gw-selection"});
}

//>>> RUN <<<//
function renderGuwed(domId) {
    $(document).ready(function() {

        //Create the wrap box
        var box = $("#"+domId);
        var wrapper = $('<span/>', {class: "gw-wrapper empty"});
        wrapper.nElems = 0;
        wrapper.appendTo(box);

        wrapper.selection = initSelection();
        wrapper.inSelection = false;

        var input = $('<textarea/>', {class: "gw-input"});
        input.appendTo(wrapper);

        var caret = caretCreate(500);
        caret.appendTo(wrapper);

        wrapper.click(function() {
            caretShow(caret);
            input.focus();
        });

        input.keyup(function(e) {
            var th = $(this);
            key = e.which;
            switch (key) {
                case 37: //Left arrow
                    caretMove(caret, "before", caret.prev());
                break;
                case 39: //Right arrow
                    caretMove(caret, "after", caret.next());
                break;
                case 46: //Right arrow
                    caret.next().remove();
                break;
                case 8:
                    caret.prev().remove();
                break;
                default:
                    var text = th.val();
                    for (var i=0; i<text.length; i++) {
                        var newElem = $('<span/>', {class: "gw-elem gw-math-elem"});
                        newElem.html(text[i]);
                        newElem.insertBefore(caret);
                        wrapper.nElems++;
                    }
                    th.val("");

                    if (wrapper.nElems > 0) {
                        wrapper.removeClass("empty");
                    }
            }
        });

        function selectionMouseOverHandler(e) {
            th = $(this);
            console.log("mouse over "+th.html());
            th.bind("mousemove", selectionMouseMoveHandler);
            th.unbind(e);
        }

        function selectionMouseMoveHandler(e) {
            var th = $(this);
            console.log("mouse move: "+th.html()+"-> "+(e.pageX-th.offset().left));
            var relPos = getRelativePos(caret, th);
            console.log("relPos: "+relPos);
            console.log("at "+isLeftOrRightHalf(e.pageX, th));
            if (isLeftOrRightHalf(e.pageX, th) !== relPos) {
                console.log("passed");
                select(wrapper, th, relPos);
                $(this).unbind(e);
            }
        }

        wrapper.on("mousedown", ".gw-math-elem", function(e) {
            var th = $(this);
            console.log("mousedown on "+th.html());
            isLeftOrRightHalf(e.pageX, th,
                function() {
                    caret.insertBefore(th);
                },
                function() {
                    caret.insertAfter(th);
                }
            );
            //deselect(wrapper);
            //wrapper.selectStart = e.pageX;
            wrapper.inSelection = true;
            th.bind("mousemove", selectionMouseMoveHandler);
            wrapper.children(".gw-math-elem").not(th).bind("mouseover", selectionMouseOverHandler);
        });

        function unbindSelectionHandlers(e) {
            if (wrapper.inSelection) {
                console.log("ubind!");
                wrapper.inSelection = false;
                wrapper.children(".gw-math-elem").unbind("mouseover", selectionMouseOverHandler);
                wrapper.children(".gw-math-elem").unbind("mousemove", selectionMouseMoveHandler);
            }
        }

        wrapper.mouseup(unbindSelectionHandlers);

        wrapper.on("mouseout", ".gw-math-elem", function(e) {
            if (wrapper.inSelection) {
                th = $(this);
                th.unbind("mouseover", selectionMouseOverHandler);
                th.unbind("mousemove", selectionMouseMoveHandler);
            }
        });
    });
}
