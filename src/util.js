'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseBounds = parseBounds;
exports.getWidthOrHeight = getWidthOrHeight;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.findChild = findChild;
exports.detectDrag = detectDrag;
exports.dispatchClicks = dispatchClicks;

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseBounds(bounds) {
    bounds.x = bounds.x ? bounds.x : 0;
    bounds.y = bounds.y ? bounds.y : 0;
    if (bounds.width <= 0) {
        console.warn('PhaserListView: bounds.width <= 0');
    } else if (bounds.height <= 0) {
        console.warn('PhaserListView: bounds.height <= 0');
    }
    return bounds;
}

// prefer nominalWidth and nominalHeight
function getWidthOrHeight(displayObject, widthOrHeight) {
    return displayObject['nominal' + capitalizeFirstLetter(widthOrHeight)] || displayObject[widthOrHeight];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function findChild(children, predicate) {
    var scope = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    if (!children) return false;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!child) continue;
        if (predicate.call(scope, child)) {
            return child;
        }
        var found = findChild(child.children, predicate, scope);
        if (found) {
            return found;
        }
    }
    return false;
}

function detectDrag(pointer) {
    var distanceX = Math.abs(pointer.positionDown.x - pointer.positionUp.x);
    var distanceY = Math.abs(pointer.positionDown.y - pointer.positionUp.y);
    var time = pointer.timeUp - pointer.timeDown;
    return distanceX > _config2.default.AUTO_DETECT_THRESHOLD || distanceY > _config2.default.AUTO_DETECT_THRESHOLD;
}

function dispatchClicks(pointer, clickables, type) {
    if (type == 'onInputUp' && detectDrag(pointer)) return;
    // SEARCH OBJECT UNDER POINT AS THERE IS NO CLICK PROPAGATION SUPPORT IN PHASER
    var found = findChild(clickables, function(clickable) {
        var pt = clickable.worldPosition;
        var anchor = clickable.anchor;
        var pivot = clickable.pivot;

        var width = clickable.width / window.devicePixelRatio;
        var height = clickable.height / window.devicePixelRatio;
        var scale = clickable.scale;
        var x = pt.x - (anchor ? anchor.x * width : 0) - pivot.x * scale.x;
        var y = pt.y - (anchor ? anchor.y * height : 0) - pivot.y * scale.y;
        // console.log('does ', x, y, clickable.width, clickable.height, ' intersect ', pointer.x, pointer.y)
        return clickable.inputEnabled && new Phaser.Rectangle(x, y, width, height).contains(pointer.x, pointer.y);
    });
    if (found && found.events && found.events[type] && found.events[type].dispatch) {
        found.events[type].dispatch(found, pointer, true);
    }
    return found;
}