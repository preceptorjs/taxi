module.exports = {

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
            viewPortWidth: el.offsetWidth
        };

        de.removeChild(el);

        // Remove scrollbars
        body.style.overflow = 'hidden';

        // Make document only one pixel height and twice wide as the view-port
        body.style.width = (initData.viewPortWidth * 2) + 'px';
        body.style.height = '1px';

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