'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function() {
    function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
    direction: 'y',
    autocull: true,
    padding: 10
};

var ListViewCore = function() {
    function ListViewCore(game, parent, bounds) {
        var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        _classCallCheck(this, ListViewCore);

        this.game = game;
        this.parent = parent;
        this.bounds = bounds;

        this.o = this.options = Object.assign({}, defaultOptions, options);

        this.items = [];

        if (this.o.direction == 'y') {
            this.p = { xy: 'y', wh: 'height' };
        } else {
            this.p = { xy: 'x', wh: 'width' };
        }

        this.grp = this.game.add.group(parent);
        this.grp.position.set(bounds.x, bounds.y);

        this.events = {
            onAdded: new Phaser.Signal()
        };

        this.position = 0;

        // [MC] - is masking the fastest option here? Cropping the texture may be faster?
        this.grp.mask = this._addMask(bounds);
    }

    /**
     * [add a child to the list
     * stacks them on top of each other by measuring their
     * height and adding custom padding. Optionally you can
     * specify nominalHeight or nominalWidth on the display object,
     * this will take preference over height and width]
     * @param {DisplayObject} child
     */


    _createClass(ListViewCore, [{
        key: 'add',
        value: function add(child) {
            this.items.push(child);
            var xy = 0;
            if (this.grp.children.length > 0) {
                var lastChild = this.grp.getChildAt(this.grp.children.length - 1);
                xy = lastChild[this.p.xy] + (0, _util.getWidthOrHeight)(lastChild, this.p.wh) / window.devicePixelRatio + this.o.padding;

            }

            child[this.p.xy] = xy;
            this.grp.addChild(child);
            this.length = (xy + child[this.p.wh] / window.devicePixelRatio);
            // this._setPosition(this.position)
            this.events.onAdded.dispatch(this.length - this.bounds[this.p.wh]);
            return child;
        }

        /**
         * [addMultiple children to the list]
         * @param {...[DisplayObjects]} children
         */

    }, {
        key: 'addMultiple',
        value: function addMultiple() {
            for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
                children[_key] = arguments[_key];
            }

            children.forEach(this.add, this);
        }
    }, {
        key: 'remove',
        value: function remove(child) {
            this.grp.removeChild(child);
            var index = this.items.indexOf(child);
            if (index == -1) return;
            this.items.splice(index, 1);
            return child;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.events.onAdded.dispose();
            this.events = null;
            this.grp.destroy();
            this.grp = null;
            this.game = null;
            this.parent = null;
            this.items = null;
        }

        /**
         * [removeAll - removes all children from the group]
         * @note This does not reset the position of the ListView.
         */

    }, {
        key: 'removeAll',
        value: function removeAll() {
            this.grp.removeAll();
            this.items = [];
        }

        /**
         * [cull - culls the off-screen list elements]
         * mainly called internally with the autoCull property
         */

    }, {
        key: 'cull',
        value: function cull() {
            for (var i = 0; i < this.items.length; i++) {
                var child = this.items[i];
                child.visible = true;
                if (child[this.p.xy] + (0, _util.getWidthOrHeight)(child, this.p.wh) + this.grp[this.p.xy] < this.bounds[this.p.xy]) {
                    child.visible = false;
                } else if (child[this.p.xy] + this.grp[this.p.xy] > this.bounds[this.p.xy] + this.bounds[this.p.wh]) {
                    child.visible = false;
                }
            }
        }
    }, {
        key: 'getPositionByItemIndex',
        value: function getPositionByItemIndex(index) {
            return -this.items[index][this.p.xy];
        }

        // @deprecated

    }, {
        key: 'setPosition',
        value: function setPosition(position) {
            this.moveToPosition(position);
        }
    }, {
        key: 'moveToPosition',
        value: function moveToPosition(position) {
            this.scroller.setTo(position);
        }
    }, {
        key: 'moveToItem',
        value: function moveToItem(index) {
            this.scroller.setTo(this.getPositionByItemIndex(index));
        }
    }, {
        key: 'tweenToPosition',
        value: function tweenToPosition(position) {
            var duration = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

            this.scroller.tweenTo(duration, position);
        }
    }, {
        key: 'tweenToItem',
        value: function tweenToItem(index) {
            var duration = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

            this.scroller.tweenTo(duration, this.getPositionByItemIndex(index));
        }

        /**
         * @private
         */

    }, {
        key: '_setPosition',
        value: function _setPosition(position) {
            this.position = position;
            this.grp[this.p.xy] = this.bounds[this.p.xy] + position;
            if (this.o.autocull) this.cull();
        }

        /**
         * @private
         */

    }, {
        key: '_addMask',
        value: function _addMask(bounds) {
            var mask = this.game.add.graphics(0, 0, this.parent);
            mask.beginFill(0xff0000).drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
            mask.alpha = 0;
            return mask;
        }
    }]);

    return ListViewCore;
}();

exports.default = ListViewCore;