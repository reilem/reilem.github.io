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

function observeIntersections() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('INTERSECTING', entry.target);
                entry.target.classList.add('start-transition');
            }
        });
    });
    observer.observe(document.querySelector('.transition-enabled'));
}
