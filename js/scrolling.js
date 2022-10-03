/**
 * Scrolls down one page
 */
function scrollToSecondPage() {
    window.scroll({
        top: window.innerHeight,
        left: 0,
        behavior: 'smooth',
    });
}

/**
 * Removes all no-js tags to enable animations
 * If js is not turned on, then the no-js tags will remain and content won't be hidden.
 */
function wipeNoJsTags() {
    const elements = document.querySelectorAll('.no-js');
    elements.forEach(element => element.classList.remove('no-js'));
}

/**
 * Observe view port intersections to trigger css
 */
function observeIntersections() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    });
    document.querySelectorAll('.opacity-transition').forEach(element => observer.observe(element));
}
