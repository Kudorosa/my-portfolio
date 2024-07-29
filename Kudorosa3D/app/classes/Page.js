import GSAP from "gsap"

import Prefix from "prefix"

import each from "lodash/each"
import map from "lodash/map"

import Title from "animations/Title"
import Paragraph from "animations/Paragraph"
import Label from "animations/Label"
import Highlight from "animations/Highlight"

import AsyncLoad from "classes/AsyncLoad"

import { ColorsManager } from "classes/Colors"

export default class Page {
    constructor({ element, elements, id }) {
        this.selector = element
        this.selectorChildren = {
            ...elements,

            animationsHighlights: `[data-animation="highlight"]`,
            animationsTitles: `[data-animation="title"]`,
            animationsLabels: `[data-animation="label"]`,
            animationsParagraphs: `[data-animation="paragraph"]`,

            preloaders: '[data-src]'
        }

        this.id = id
        this.transformPrefix = Prefix("transform")
    }

    create() {
        this.element = document.querySelector(this.selector) // Saves memory by not destroying and creating different classes
        this.elements = {}

        this.scroll = {
            current: 0,
            target: 0, 
            last: 0,
            limit: 0
        }

        each(this.selectorChildren, (entry, key) => {
            if (entry instanceof window.HTMLElement || entry instanceof window.NodeList || Array.isArray(entry)) {
                this.elements[key] = entry
            }
            else {
                this.elements[key] = document.querySelectorAll(entry)

                if (this.elements[key].length === 0) {
                    this.elements[key] = null
                }
                else if (this.elements[key].length === 1) {
                    this.elements[key] = document.querySelector(entry)
                }
            }
        })

        this.createAnimations()
        this.createPreloader()
    }

    createPreloader() {
        this.preloaders = map(this.elements.preloaders, element => {
            return new AsyncLoad({ element })
        })
    }

    // Animations 

    createAnimations() {
        this.animations = []

         // Titles 
         this.animationsTitles = map(this.elements.animationsTitles, element => {
            return new Title({
                element
            })
        })

        this.animations.push(...this.animationsTitles)

        // Paragraphs
        this.animationsParagraphs = map(this.elements.animationsParagraphs, element => {
            return new Paragraph({
                element
            })
        })

        this.animations.push(...this.animationsParagraphs)
        
        // Labels
        this.animationsLabels = map(this.elements.animationsLabels, element => {
            return new Label({
                element
            })
        })

        this.animations.push(...this.animationsLabels)

         // Highlights
         this.animationsHighlights = map(this.elements.animationsHighlights, element => {
            return new Highlight({
                element
            })
        })

        this.animations.push(...this.animationsHighlights)
    }


    /**
     * Animations
     */
    show(animation) {
        return new Promise(resolve => {
            ColorsManager.change({
                backgroundColor: this.element.getAttribute("data-background"),
                color: this.element.getAttribute("data-color"),
            })

            if (animation) {
                this.animationIn = animation
            }
            else {
                this.animationIn = GSAP.timeline()

                this.animationIn.fromTo(this.element, {
                    autoAlpha: 0,
                }, {
                    autoAlpha: 1,
                })
            }
            
            this.animationIn.call(_ => {
                this.addEventListeners()
                resolve()
            })
        })
    }

    hide() {
        return new Promise(resolve => {
            this.destroy()

            this.animationOut = GSAP.timeline()

            this.animationOut.to(this.element, {
                autoAlpha: 0,
                onComplete: resolve
            })
        })
    }

    /**
     * Events
     */
    
    onResize() {
        if (this.elements.wrapper) {
            this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
        }
        
        each(this.animations, animation => animation.onResize())
    }
    
    onWheel( { pixelY }) {
        this.scroll.target += pixelY
    }

    onTouchStart(event) {
        this.scroll.startY = event.touches ? event.touches[0].clientY : event.clientY
        this.scroll.touchDelta = 0
    }

    onTouchMove(event) {
        const y = event.touches ? event.touches[0].clientY : event.clientY
        this.scroll.touchDelta = this.scroll.startY - y
        this.scroll.target += this.scroll.touchDelta
        this.scroll.startY = y
    }

    onTouchEnd() {
        this.scroll.touchDelta = 0
    }
    
    /**
     * Loop
     */
    update() {
        this.scroll.target = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target)
        
        this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1) // Lower == More Smooth but more Cost

        if (this.scroll.current < 0.01) {
            this.scroll.current = 0
        }

        if (this.elements.wrapper) {
            this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
        }

    }

    /**
     * Listeners
     */
    addEventListeners() {
        window.addEventListener('touchstart', this.onTouchStart.bind(this))
        window.addEventListener('touchmove', this.onTouchMove.bind(this))
        window.addEventListener('touchend', this.onTouchEnd.bind(this))
    }
    
    removeEventListeners() {
        window.removeEventListener('touchstart', this.onTouchStart.bind(this))
        window.removeEventListener('touchmove', this.onTouchMove.bind(this))
        window.removeEventListener('touchend', this.onTouchEnd.bind(this))
    }

    /**
     * Destroy
     */
    destroy() {
        this.removeEventListeners()
    }
}

// COMPLETE