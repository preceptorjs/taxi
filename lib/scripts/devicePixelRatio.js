module.exports = {

    // This is done to fix some issues with Chrome:
    // http://www.quirksmode.org/blog/archives/2012/06/devicepixelrati.html
    // The property window.devicePixelRatio cannot be trusted in most browsers (if even available).

    init: function () {
        var de = document.documentElement,
            body = document.body,
            el, initData;

        // Create a div to figure out the size of the view-port across browsers
        el = document.createElement('div');
        el.style.position = "fixed";
        el.style.top = 0;
        el.style.left = 0;
        el.style.bottom = 0;
        el.style.right = 0;
        de.insertBefore(el, de.firstChild);

        initData = {
            bodyOverflow: body.style.overflow,
            bodyWidth: body.style.width,
            bodyHeight: body.style.height,
            documentWidth: Math.max(body.scrollWidth, body.offsetWidth, de.clientWidth, de.scrollWidth, de.offsetWidth),
            devicePixelRatio: window.devicePixelRatio || 1,
            padding: body.style.padding,
            viewPortWidth: el.offsetWidth
        };

        de.removeChild(el);

        // Remove scrollbars
        body.style.overflow = 'hidden';

        // Make document only one pixel height and as wide as the view-port
        body.style.width = initData.viewPortWidth + 'px';
        body.style.height = '1px';
        body.style.minHeight = '0';
        body.style.minWidth = '0';

        de.style.width = initData.viewPortWidth + 'px';
        de.style.height = '1px';
        de.style.minHeight = '0';
        de.style.minWidth = '0';
        de.style.overflow = 'hidden';

        return initData;
    },

    revert: function (initData) {
        var initData = arguments[0],
            body = document.body;

        body.style.overflow = initData.bodyOverflow;
        body.style.width = initData.bodyWidth;
        body.style.height = initData.bodyHeight;
    }
};