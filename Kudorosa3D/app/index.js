import NormalizeWheel from "normalize-wheel"

import each from "lodash/each"

import Canvas from "components/Canvas"

import Navigation from "components/Navigation"
import Preloader from "components/Preloader"

import About from "pages/About"
import Collections from "pages/Collections"
import Home from "pages/Home"
import Detail from "pages/Detail"

class App {
    constructor() {
        this.createContent()

        this.createCanvas()
        this.createPreloader()
        this.createNavigation()
        this.createPages()

        this.addEventListeners()
        this.addLinkListeners()

        this.onResize()

        this.update()
    }

    createNavigation() {
        this.navigation = new Navigation({
            template: this.template
        })
    }

    createPreloader() {
        this.preloader = new Preloader({
            canvas: this.canvas
        })

        this.preloader.once("completed", this.onPreloaded.bind(this))
    }

    createCanvas() {
        this.canvas = new Canvas({
            template: this.template
        })
    }

    createContent() {
        this.content = document.querySelector(".content") // Selects the 'content' div element.
        this.template = this.content.getAttribute("data-template")
    }

    createPages() {
        this.pages = {
            about: new About(),
            collections: new Collections(),
            home: new Home(),
            detail: new Detail()
        }

        this.page = this.pages[this.template]
        this.page.create()
    }

    // Events ------------------------------------------------------------------

    onPreloaded() {
        this.onResize()

        this.canvas.onPreloaded()

        this.page.show()
    }

    onPopState() {
        this.onChange({
            url: window.location.pathname,
            push: true, // false
        })
    }

    async onChange({ url, push = true }) {
        this.canvas.onChangeStart(this.template, url)

        await this.page.hide()

        const request = await window.fetch(url)

        if (request.status === 200) {
            const html = await request.text()
            const div = document.createElement("div")

            if (push) {
                window.history.pushState({}, "", url)
            }

            div.innerHTML = html

            const divContent = div.querySelector(".content")

            this.template = divContent.getAttribute("data-template")

            this.navigation.onChange(this.template)

            this.content.setAttribute("data-template", this.template)
            this.content.innerHTML = divContent.innerHTML

            this.canvas.onChangeEnd(this.template)

            this.page = this.pages[this.template]
            this.page.create()

            this.onResize()

            this.page.show()

            this.addLinkListeners()
        }
        else {
            console.error(`response status: ${request.status}`)
        }
    }

    onResize() {
        if (this.page && this.page.onResize) {
            this.page.onResize()
        }

        window.requestAnimationFrame(_ => {
            if (this.canvas && this.canvas.onResize) {
                this.canvas.onResize()
            }
        })
    }

    onTouchDown(event) {
        if (this.canvas && this.canvas.onTouchDown) {
            this.canvas.onTouchDown(event)
        }
    }

    onTouchMove(event) {
        if (this.canvas && this.canvas.onTouchMove) {
            this.canvas.onTouchMove(event)
        }
    }

    onTouchUp(event) {
        if (this.canvas && this.canvas.onTouchUp) {
            this.canvas.onTouchUp(event)
        }
    }

    onWheel(event) {
        const normalizedWheel = NormalizeWheel(event)

        if (this.canvas && this.canvas.onWheel) {
            this.canvas.onWheel(normalizedWheel)
        }

        if (this.page && this.page.onWheel) {
            this.page.onWheel(normalizedWheel)
        }
    }

    /**
     * Loop ------------------------------------------------------------------
     */

    update() {

        if (this.page && this.page.update) { // Page is updated first so Canvas gets correct Y Position
            this.page.update()
        }

        if (this.canvas && this.canvas.update) {
            this.canvas.update(this.page.scroll)
        }

        this.frame = window.requestAnimationFrame(this.update.bind(this))
    }

    // Listeners ------------------------------------------------------------------

    addEventListeners() {
        window.addEventListener("popstate", this.onPopState.bind(this))
        window.addEventListener("mousewheel", this.onWheel.bind(this))

        window.addEventListener("mousedown", this.onTouchDown.bind(this))
        window.addEventListener("mousemove", this.onTouchMove.bind(this))
        window.addEventListener("mouseup", this.onTouchUp.bind(this))

        window.addEventListener("touchstart", this.onTouchDown.bind(this))
        window.addEventListener("touchmove", this.onTouchMove.bind(this))
        window.addEventListener("touchend", this.onTouchUp.bind(this))

        window.addEventListener("resize", this.onResize.bind(this))
    }

    addLinkListeners() {
        const links = document.querySelectorAll("a")

        each(links, link => {
            link.onclick = event => {
                event.preventDefault()

                const { href } = link
                const currentUrl = window.location

                if (link.getAttribute("disabled") || href == currentUrl) return
                link.setAttribute("disabled", true)

                console.log(`HREF: ${href}   Current URL: ${currentUrl}`)

                this.onChange({ url: href }).finally(() => {

                    setTimeout(() => {
                        link.removeAttribute("disabled")
                    }, 2000)
                })
            }
        })
    }
}

new App()

// COMPLETE