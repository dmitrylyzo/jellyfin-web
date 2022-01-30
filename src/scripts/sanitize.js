import DOMPurify from 'dompurify';

// Persistent DOMPurify configuration
// If we want a customized configuration, we can mixin the options that are passed to the function.
DOMPurify.setConfig({
    PARSER_MEDIA_TYPE: 'application/xhtml+xml' // WebKit doesn't support 'text/html' (default), but 'application/xhtml+xml' works
});

/**
 * Clears string or HTML-tree.
 * @param {string|HTMLElement} dirty - Dirty string or root HTML-element.
 * @returns {string} Clean (sanitized) string.
 */
export function sanitize(dirty, options) {
    return DOMPurify.sanitize(dirty, options);
}
