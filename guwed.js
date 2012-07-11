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
    //console.log("caret Move!");
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
    center1 = elem1.offset().left + elem1.width()/2;
    center2 = elem2.offset().left + elem2.width()/2;
    if (center1 > center2) {
        return RIGHT;
    } else {
        return LEFT;
    }
}

//function select(wrapper, elem, fromWhere) {
    //wrapper.selection.insertAfter(elem);

    //if (fromWhere == LEFT) {
        //elem.appendTo(wrapper.selection);
    //} else {
        //elem.prependTo(wrapper.selection);
    //}
//}
//

function createSelection(wrapper, startFrom) {
    if (startFrom === LEFT) {
        wrapper.selection.insertAfter(wrapper.caret);
    } else {
        wrapper.selection.insertBefore(wrapper.caret);
    }
}

function deselect(wrapper, returnElem) {
    var wouldReturn = returnElem && isSelected(returnElem);
    if (wouldReturn) returnElem.attr("id", "deselect-return");
    wrapper.selection.replaceWith(wrapper.selection.html());
    initSelection(wrapper);
    if (wouldReturn) {
        returnElem = wrapper.children("#deselect-return");
        returnElem.removeAttr("id");
    }
    return returnElem;
}

function initSelection(wrapper) {
    wrapper.selection = $('<span/>', {id: "gw-selection"});
}

function isSelected(elem) {
    return elem.parent().attr("id") === "gw-selection";
}

function deleteSelection(wrapper) {
    wrapper.selection.remove();
    initSelection(wrapper);
}

function hasSelection(wrapper) {
    return wrapper.children("#gw-selection").length > 0;
}

//>>> RUN <<<//
function renderGuwed(domId) {
    $(document).ready(function() {

        //Create the wrap box
        var box = $("#"+domId);
        var wrapper = $('<span/>', {class: "gw-wrapper empty"});
        wrapper.appendTo(box);

        initSelection(wrapper);
        wrapper.inSelection = false;

        var input = $('<textarea/>', {class: "gw-input"});
        input.appendTo(box);
        wrapper.input = input;

        var caret = caretCreate(500);
        caret.appendTo(wrapper);
        wrapper.caret = caret;

        wrapper.click(function() {
            caretShow(caret);
            input.focus();
        });

        input.keyup(function(e) {
            var th = $(this);
            key = e.which;

            //Helper functions for key processing
            function delOrBksp(fnNormalAction) {
                if (hasSelection(wrapper))
                    deleteSelection(wrapper);
                else
                    fnNormalAction();
            }

            function arrowKey(fnNormalAction, fnShift) {
                fnNormalAction();
                if (hasSelection(wrapper))
                    deselect(wrapper);
                if (e.shiftKey) {
                    fnShift();
                }
            }
            ///

            switch (key) {
                case 37: //Left arrow
                    arrowKey(function() {
                        caretMove(caret, "before", caret.prev());
                    }, function() {
                        createSelection(wrapper, RIGHT);
                        caret.next().appendTo(wrapper.selection);
                    });
                break;
                case 39: //Right arrow
                    arrowKey(function() {
                        caretMove(caret, "after", caret.next());
                    }, function() {
                        createSelection(wrapper, LEFT);
                        caret.prev().appendTo(wrapper.selection);
                    });
                break;
                case 46: //delete
                    delOrBksp(function() {
                        caret.next().remove();
                    });
                break;
                case 8: //backspace
                    delOrBksp(function() {
                        caret.prev().remove();
                    });
                break;
                default:
                    var text = th.val();
                    for (var i=0; i<text.length; i++) {
                        var newElem = $('<span/>', {class: "gw-elem gw-math-elem"});
                        newElem.html(text[i]);
                        if (hasSelection(wrapper)) {
                            wrapper.selection.replaceWith(newElem);
                            caretMove(wrapper.caret, "after", newElem);
                        } else {
                            newElem.insertBefore(caret);
                        }
                    }
                    th.val("");

                    if (wrapper.html().length > 0) {
                        wrapper.removeClass("empty");
                    }
            }
        });

        //function selectionMouseOverHandler(e) {
            //th = $(this);
            //console.log("mouse over "+th.html());
            //th.bind("mousemove", selectionMouseMoveHandler);
            //th.unbind(e);
        //}

        function selectionMouseMoveHandler(e) {
            var th = $(this);
            //console.log("mouse move: "+th.html()+"-> "+(e.pageX-th.offset().left));
            //console.log("caret: ", wrapper.caret.index());
            var startFrom = getRelativePos(wrapper.caret, th);
            if (!wrapper.inSelection) {
                createSelection(wrapper, startFrom);
                wrapper.inSelection = true;
            }
            //console.log("sf "+startFrom);
            //console.log("at "+isLeftOrRightHalf(e.pageX, th));
            if (isLeftOrRightHalf(e.pageX, th) !== startFrom) {
                if (!isSelected(th)) {
                    //console.log("passed!");
                    var selected;
                    if (startFrom === LEFT) {
                        //console.log((th.index()+1)+" : "+(wrapper.selection.index()+1));
                        selected = wrapper.children().slice(wrapper.selection.index()+1, th.index()+1);
                        selected.appendTo(wrapper.selection);
                    } else {
                        selected = wrapper.children().slice(th.index(), wrapper.selection.index());
                        selected.prependTo(wrapper.selection);
                    }
                }
            } else {
                if (isSelected(th)) {
                    //console.log("fuck!!");
                    //console.log($(this).html() + "deselected!")
                    var deselected;
                    if (startFrom === LEFT) {
                        deselected = th;
                        deselected = deselected.add(th.nextAll());
                        deselected.insertAfter(wrapper.selection);
                    } else {
                        deselected = th.prevAll();
                        deselected = deselected.add(th);
                        deselected.insertBefore(wrapper.selection);
                    }
                }
            }
        }

        wrapper.on("mousedown", ".gw-math-elem", function(e) {
            var th = $(this);
            th = deselect(wrapper, th);
            //console.log("mousedown on "+th.html());
            isLeftOrRightHalf(e.pageX, th,
                function() {
                    caretMove(wrapper.caret, "before", th);
                },
                function() {
                    caretMove(wrapper.caret, "after", th);
                }
            );
            //th.bind("mousemove", selectionMouseMoveHandler);
            //wrapper.children(".gw-math-elem").not(th).bind("mouseover", selectionMouseOverHandler);
            wrapper.on("mousemove", ".gw-math-elem", selectionMouseMoveHandler);
        });

        wrapper.mouseup(function() {
                //console.log("ubind!");
                wrapper.inSelection = false;
                //wrapper.children(".gw-math-elem").unbind("mouseover", selectionMouseOverHandler);
                wrapper.off("mousemove", ".gw-math-elem", selectionMouseMoveHandler);
                wrapper.input.focus();
        });

        //wrapper.mouseleave(function(e) {
            //if (wrapper.inSelection) {
                //th = $(this);
                ////th.unbind("mouseover", selectionMouseOverHandler);
                //th.unbind("mousemove", selectionMouseMoveHandler);
                //wrapper.inSelection = false;
            //}
        //});


    });
}
