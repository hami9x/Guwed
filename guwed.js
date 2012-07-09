var DEFAULT_FONT_SIZE = "20px";

////////////////////////////////////////////////////////////////////
// Caret
////////////////////////////////////////////////////////////////////
function caretCreate(blinkInterval) {
    var caret = $('<span/>', {class: "gw-elem gw-caret", id: "#caret"});

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

//>>> RUN <<<//
function renderGuwed(domId) {
    $(document).ready(function() {

        //Create the wrap box
        var box = $("#"+domId);
        var wrapper = $('<span/>', {class: "gw-wrapper empty"});
        wrapper.nElems = 0;
        wrapper.appendTo(box);

        var input = $('<textarea/>', {class: "gw-input"});
        input.appendTo(wrapper);

        var caret = caretCreate(500);
        caret.appendTo(wrapper);

        wrapper.click(function() {
            caretShow(caret);
            input.focus();
        });

        input.keyup(function() {
            var th = $(this);
            var char = th.val();
            if (char.length > 0) {
                var newElem = $('<span/>', {class: "gw-elem gw-math-elem"});
                newElem.html(char);
                newElem.insertBefore(caret);
                th.val("");
                wrapper.nElems++;
            }

            if (wrapper.nElems > 0) {
                wrapper.removeClass("empty");
            }
        });

        wrapper.on("click", ".gw-math-elem", function(e) {
            var th = $(this);
            var relOffsetX = e.pageX - th.offset().left;
            //var relOffsetY = e.pageY - th.offset().top;
            if (relOffsetX >= th.width()/2) {
                caretMove(caret, "after", th);
            } else {
                caretMove(caret, "before", th);
            }
        });
    });
}
