module.exports = {

    prepareScreenshot: function () {
        var canvas = document.getElementById('fxdriver-screenshot-canvas');
        if (canvas == null) {
            canvas = document.createElement('canvas');
            canvas.id = 'fxdriver-screenshot-canvas';
            canvas.style.display = 'none';
            document.documentElement.appendChild(canvas);
            Object.defineProperty(canvas, 'height', {
                get: function (value) { return 30; },
                set: function (value) {}
            });
        }
    },

    init: function () {

        var initData = {
                viewPort: {},
                document: {},
                bodyTransform: {}
            },

            de = document.documentElement,
            el = document.createElement('div'),
            body = document.body;

        // Get current scroll-position
        initData.viewPort.x = window.pageXOffset;
        initData.viewPort.y = window.pageYOffset;

        // Get current view-port size
        el.style.position = "fixed";
        el.style.top = 0;
        el.style.left = 0;
        el.style.bottom = 0;
        el.style.right = 0;
        de.insertBefore(el, de.firstChild);
        initData.viewPort.width = el.offsetWidth;
        initData.viewPort.height = el.offsetHeight;
        de.removeChild(el);

        // Get document size & state of scrollbar styles
        initData.document.width = Math.max(body.scrollWidth, body.offsetWidth, de.clientWidth, de.scrollWidth, de.offsetWidth);
        initData.document.height = Math.max(body.scrollHeight, body.offsetHeight, de.clientHeight, de.scrollHeight, de.offsetHeight);
        initData.document.cssHeight = body.style.height;
        initData.document.overflow = body.style.overflow;

        // See which transformation property to use and what value it has
        // Needed for scroll-translation without the page actually knowing about it
        if (body.style.webkitTransform !== undefined) {
            initData.bodyTransform.property = 'webkitTransform';
        } else if (body.style.mozTransform !== undefined) {
            initData.bodyTransform.property = 'mozTransform';
        } else if (body.style.msTransform !== undefined) {
            initData.bodyTransform.property = 'msTransform';
        } else if (body.style.oTransform !== undefined) {
            initData.bodyTransform.property = 'oTransform';
        } else {
            initData.bodyTransform.property = 'transform';
        }
        initData.bodyTransform.value = body.style[initData.bodyTransform.property];

        // Change document

        // Remove scrollbars
        //body.style.overflow = 'hidden';

        // Reset scrolling through translate
        body.style[initData.bodyTransform.property] = 'translate(' + initData.viewPort.x + 'px, ' + initData.viewPort.y + 'px)';

        return initData;
    },

    revert: function (initData) {
        var initData = arguments[0],
            body = document.body;

        // Reset document height (if changed at all)
        body.style.height = initData.document.cssHeight;

        // Reset document offset
        body.style[initData.bodyTransform.property] = initData.bodyTransform.value;

        // Reset scrollbars
        //body.style.overflow = initData.document.overflow;
    },


    documentOffset: function (x, y, height, initData) {
        var x = arguments[0],
            y = arguments[1],
            height = arguments[2],
            initData = arguments[3],

            body = document.body,
            property = initData.bodyTransform.property,
            initX = initData.viewPort.x,
            initY = initData.viewPort.y;

        body.style[property] = 'translate(' + ((x * -1) + initX) + 'px, ' + ((y * -1) + initY) + 'px)';

        if (height) {
            body.style.height = height;
        }
    }
};