(function () {
    'use strict';

    /* ── State ────────────────────────────────────────────── */
    var items = [];   // { el, src, alt }
    var current = 0;

    /* ── DOM ──────────────────────────────────────────────── */
    var lb = document.getElementById('glb-lightbox');
    var imgEl = document.getElementById('glb-img');
    var counter = document.getElementById('glb-counter');
    var btnClose = document.getElementById('glb-close');
    var btnPrev = document.getElementById('glb-prev');
    var btnNext = document.getElementById('glb-next');

    /* ── Helpers ──────────────────────────────────────────── */

    function noop() { }

    /**
     * refresh()
     * Re-collects all [data-gallery-item] figures and rebinds
     * click/keyboard handlers. Safe to call multiple times.
     * Called automatically on init and exposed on window.Gallery
     * for ScrollMagic infinite-scroll batches.
     */
    function refresh() {
        var figs = document.querySelectorAll('[data-gallery-item]');

        items = Array.prototype.map.call(figs, function (el) {
            return {
                el: el,
                src: el.getAttribute('data-gallery-src') ||
                    (el.querySelector('img') ? el.querySelector('img').src : ''),
                alt: el.querySelector('img') ? el.querySelector('img').alt : ''
            };
        });

        Array.prototype.forEach.call(figs, function (el, i) {
            /* Remove old listeners to stay idempotent */
            el.removeEventListener('click', el._glbClick || noop);
            el.removeEventListener('keydown', el._glbKeydown || noop);

            el._glbClick = function () { open(i); };
            el._glbKeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(i);
                }
            };

            el.addEventListener('click', el._glbClick);
            el.addEventListener('keydown', el._glbKeydown);
        });
    }

    /** show(index) — load image at index with wrap-around */
    function show(index) {
        var total = items.length;
        if (!total) return;
        current = ((index % total) + total) % total;

        /*
         * Replacing the node restarts the CSS animation on each
         * navigation — cleaner than toggling a class.
         */
        var clone = imgEl.cloneNode(false);
        clone.id = 'glb-img';
        clone.src = items[current].src;
        clone.alt = items[current].alt;
        imgEl.parentNode.replaceChild(clone, imgEl);
        imgEl = clone;

        counter.textContent = (current + 1) + ' / ' + total;
    }

    function open(index) {
        show(index);
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function close() {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
        /* Return focus to the triggering item for accessibility */
        if (items[current] && items[current].el) {
            items[current].el.focus();
        }
    }

    function prev() { show(current - 1); }
    function next() { show(current + 1); }

    /* ── UI events ────────────────────────────────────────── */
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    /* Click outside image closes lightbox */
    lb.addEventListener('click', function (e) {
        if (e.target === lb) close();
    });

    /* ── Keyboard ─────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
    });

    /* ── Touch swipe ──────────────────────────────────────── */
    var startX = 0;
    var startY = 0;

    lb.addEventListener('touchstart', function (e) {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
    }, { passive: true });

    lb.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].screenX - startX;
        var dy = e.changedTouches[0].screenY - startY;
        /* Horizontal swipe must dominate and exceed threshold */
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
            if (dx < 0) next(); else prev();
        }
    }, { passive: true });

    /* ── Init ─────────────────────────────────────────────── */
    refresh();

    /* ── Public API ───────────────────────────────────────── */
    window.Gallery = {
        refresh: refresh,
        open: open,
        close: close
    };

}());