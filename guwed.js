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
        //console.log("after "+elem.html());
    break;
    case "before":
        caret.insertBefore(elem);
        //console.log("before "+elem.html());
    break;
    case "inside":
        caret.appendTo(elem);
        //console.log("appendTo "+elem.html());
    break;
    case "inside-prepend":
        caret.prependTo(elem);
        //console.log("prependTo "+elem.html());
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
    wrapper.caret.detach();
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

function exists(elem) { //Check if the jquery DOM element exists
    return elem.length > 0;
}

function hasSelection(wrapper) {
    selection = wrapper.find("#gw-selection");
    return exists(selection) && (selection.html().length > 0);
}

function createPower(wrapper) {
    var newPower = $('<sup/>', {class: "gw-wrapper gw-math-elem empty"});
    newPower.insertAfter(wrapper.caret);
    caretMove(wrapper.caret, "inside", newPower);
}

function createFraction(wrapper) {
    var newFraction = $('<span/>', {class: "gw-wrapper gw-math-elem fraction"});
    newFraction.insertAfter(wrapper.caret);
    var denominator = $('<span/>', {class: "gw-wrapper gw-math-elem empty denominator"});
    denominator.appendTo(newFraction);
    var numerator = $('<span/>', {class: "gw-wrapper gw-math-elem empty numerator"});
    numerator.appendTo(newFraction);
    caretMove(wrapper.caret, "inside", denominator);
}

function isEmpty(wrapper) {
    return wrapper.has(".gw-math-elem").length < 1;
}

function caretTraverse(wrapper, direction) {
    var traverse = function(firstTarget, caretInsertTo) {
        var target = firstTarget;
        if (exists(target)) {
            if (target.hasClass("gw-wrapper")) {
                if (caretInsertTo === "before") caretMove(wrapper.caret, "inside", target);
                else caretMove(wrapper.caret, "inside-prepend", target);
            } else {
                caretMove(wrapper.caret, caretInsertTo, target);
            }
        } else {
            target = wrapper.caret.parent();
            caretMove(wrapper.caret, caretInsertTo, target);
        }
    }
    if (direction === LEFT) {
        traverse(wrapper.caret.prev(), "before");
    } else {
        traverse(wrapper.caret.next(), "after");
    }

    if (wrapper.caret.parent().hasClass("fraction")) {
        caretTraverse(wrapper, direction);
    }
}

//>>> RUN <<<//
function renderGuwed(domId) {
    $(document).ready(function() {

        //Create the wrap box
        var box = $("#"+domId);
        var wrapper = $('<span/>', {class: "gw-grand-wrapper gw-nobksp-wrapper gw-wrapper empty"});
        wrapper.appendTo(box);
        wrapper.currentParent = wrapper;

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
            function delOrBksp(elemToRemove) {
                var rmSelection = false;
                if (hasSelection(wrapper)) {
                    elemToRemove = wrapper.selection;
                    rmSelection = true;
                }
                if (exists(elemToRemove)) {
                    var parent = elemToRemove.parent();
                    if (!rmSelection) {
                        elemToRemove.remove();
                    }
                    else {
                        deleteSelection(wrapper);
                    }
                    //console.log(parent.html());
                    if (isEmpty(parent)) {
                        parent.addClass("empty");
                    }
                }
            }

            function arrowKey(fnNormalAction, fnShift, selectMode, fnDeselectLast) {
                if (e.shiftKey) {
                    var noShift = false;
                    if (!hasSelection(wrapper)) createSelection(wrapper, selectMode);
                    else {
                        if (getRelativePos(wrapper.caret, wrapper.selection) !== selectMode) {
                            fnDeselectLast();
                            noShift = true;
                        }
                    }
                    if (!noShift) fnShift();
                    wrapper.input.focus();
                } else {
                    fnNormalAction();
                    if (hasSelection(wrapper)) {
                        deselect(wrapper);
                    }
                }

            }

            ///
            //
            var fnDefault = function() {
                var text = th.val();
                for (var i=0; i<text.length; i++) {
                    var newElem = $('<span/>', {class: "gw-elem gw-math-elem"});
                    newElem.html(text[i]);
                    if (hasSelection(wrapper)) {
                        wrapper.selection.after(newElem);
                        deleteSelection(wrapper);
                        caretMove(wrapper.caret, "after", newElem);
                    } else {
                        newElem.insertBefore(caret);
                    }
                    newElem.parent().removeClass("empty");
                }
                th.val("");
            };


            switch (key) {
                case 37: //Left arrow
                    arrowKey(function() {
                        caretTraverse(wrapper, LEFT);
                    }, function() {
                        wrapper.caret.prev().prependTo(wrapper.selection);
                    }, LEFT
                     , function() {
                         wrapper.selection.children().eq(-1)
                            .insertAfter(caret);
                    });

                break;
                case 39: //Right arrow
                    arrowKey(function() {
                        caretTraverse(wrapper, RIGHT);
                    }, function() {
                        wrapper.caret.next().appendTo(wrapper.selection);
                    }, RIGHT
                     , function() {
                         wrapper.selection.children().eq(0)
                            .insertBefore(caret);
                    });
                break;
                case 46: //delete
                    delOrBksp(wrapper.caret.next());
                break;
                case 8: //backspace
                    var toRemove = wrapper.caret.prev();
                    delOrBksp(toRemove);
                    if (!exists(toRemove)) {
                        var parent = wrapper.caret.parent();
                        if (!parent.hasClass("gw-nobksp-wrapper")) {
                            caretMove(caret, "before", parent);
                            parent.remove();
                        }
                    }
                break;
                case 54: //6 key
                    if (e.shiftKey) { //the ^ symbol
                        createPower(wrapper);
                        th.val("");
                    } else fnDefault();
                break;
                case 191:
                    if (!e.shiftKey) {
                        //alert("334");
                        createFraction(wrapper);
                        th.val("");
                    } else fnDefault();
                break;
                default:
                    if (key!=16) fnDefault();
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
            parent = th.parent();
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
                        selected = parent.children().slice(wrapper.selection.index()+1, th.index()+1);
                        selected.appendTo(wrapper.selection);
                    } else {
                        selected = parent.children().slice(th.index(), wrapper.selection.index());
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
            e.stopPropagation();
            var th = $(this);
            //console.log("mousedown on "+th.html());
            th = deselect(wrapper, th);
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
            parent = th.parent();
            wrapper.currentParent = parent;
            parent.find(".gw-math-elem").bind("mousemove", selectionMouseMoveHandler);
            //console.log("down: "+wrapper.currentParent.html());
            //if (parent.hasClass("gw-math-elem")) {
                //console.log("ubind parent!");
                //parent.unbind("mousemove", selectionMouseMoveHandler);
            //}
        });

        wrapper.on("mousedown", ".gw-wrapper.empty", function() {
            caretMove(wrapper.caret, "inside", $(this));
        });

        wrapper.mouseup(function() {
                //console.log("ubind!");
                wrapper.inSelection = false;
                //wrapper.children(".gw-math-elem").unbind("mouseover", selectionMouseOverHandler);
                wrapper.currentParent.find(".gw-math-elem").unbind("mousemove", selectionMouseMoveHandler);
                wrapper.currentParent = wrapper;
                //console.log("up: "+wrapper.currentParent.html());
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
