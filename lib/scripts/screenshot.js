module.exports = {

    /**
     * Initializes screenshots and gathers data to revert changes.
     * This function will also gather information required for
     * screenshots like dimensions of document and view-port.
     *
     * @method init
     */
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
        initData.viewPort.x = window.pageXOffset || body.scrollLeft || de.scrollLeft;
        initData.viewPort.y = window.pageYOffset || body.scrollTop || de.scrollTop;

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
        //initData.viewPort.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        //initData.viewPort.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

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

        // Reset scrolling through translate
        body.style[initData.bodyTransform.property] = 'translate(' + initData.viewPort.x + 'px, ' + initData.viewPort.y + 'px)';

        return JSON.stringify(initData);
    },

    /**
     * Reverts changes done to the document during the screenshot process
     *
     * @method revert
     * @param {object} initData Data gathered during init-phase
     */
    revert: function (initData) {
        var body = document.body;

        // Reset document height (if changed at all)
        body.style.height = initData.document.cssHeight;

        // Reset document offset
        body.style[initData.bodyTransform.property] = initData.bodyTransform.value;
    },


    /**
     * Moves document to a specified offset (instead of really scrolling)
     *
     * @param {int} x X offset of document, translating the document without scrolling
     * @param {int} y Y offset of document, translating the document without scrolling
     * @param {int|null} height Height of the document
     * @param {object} initData Data gathered during init-phase
     */
    documentOffset: function (x, y, height, initData) {
        var body = document.body,
            property = initData.bodyTransform.property,
            initX = initData.viewPort.x,
            initY = initData.viewPort.y;

        body.style[property] = 'translate(' + ((x * -1) + initX) + 'px, ' + ((y * -1) + initY) + 'px)';

        if (height) {
            body.style.height = height;
        }
    }
};