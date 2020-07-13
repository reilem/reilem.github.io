function scrollToSecond () {
    window.scroll({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth",
    })
}

function goToIndex () {
    window.location = "index.html"
}

function goToContact () {
    window.location = "contact.html"
}

function openLinkedIn () {
    window.open("https://www.linkedin.com/in/reinert-lemmens/")
}

function openGithub () {
    window.open("https://github.com/reilem")
}