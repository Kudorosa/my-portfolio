import GSAP from "gsap"
import Button from "classes/Button";
import Page from "classes/Page";

export default class Detail extends Page { 
    constructor () {
        super({
            id: "detail",
            element: ".detail",
            elements: {
                button: ".detail_button"
            }
        })

    }
    
    create() { 
        super.create()

        this.link = new Button({
            element: this.elements.button
        })
    }

    show() {
        const timeline = GSAP.timeline({
            delay: 1
        }) 

        timeline.fromTo(this.element, {
            autoAlpha: 0
        }, {
            autoAlpha: 1
        })

        super.show(timeline)
    }

    destroy() {
        super.destroy()

        this.link.removeEventListeners()
    }
}

// COMPLETE