import GSAP from "gsap"

import { Transform } from "ogl"
import map from "lodash/map"

import Media from "./Media"

export default class Gallery {
    constructor({ element, geometry, index, gl, scene, sizes }) {
        this.element = element
        this.element_wrapper = element.querySelector(".about_gallery_wrapper")
        
        this.geometry = geometry
        this.index = index
        this.gl = gl
        this.scene = scene
        this.sizes = sizes

        this.group = new Transform()

        this.scroll = {
            start: 0,
            current: 0,
            target: 0,
            lerp: 0.1,
            veloctiy: 1
        }

        this.createMedias()

        this.onResize({
            sizes: this.sizes
        })

        this.group.setParent(this.scene)
    }

    createMedias() {
        this.mediasElements = this.element.querySelectorAll(".about_gallery_media")

        this.medias = map(this.mediasElements, (element, index) => {
            return new Media({
                element,
                geometry: this.geometry,
                index,
                gl: this.gl,
                scene: this.group,
                sizes: this.sizes,
            })
        })
    }

    /**
    * Animations
    */

    show() {
        map(this.medias, media => media.show())
    }

    hide() {
        map(this.medias, media => media.hide())

    }

    /**
     * Events
     */

    onResize(event) {
        this.bounds = this.element_wrapper.getBoundingClientRect()

        this.sizes = event.sizes

        this.width = (this.bounds.width / window.innerWidth) * this.sizes.width

        this.scroll.current = this.scroll.target = 0

        map(this.medias, media => media.onResize(event, this.scroll.current))
    }

    onTouchDown({ x, y }) {
        this.scroll.start = this.scroll.current
    }

    onTouchMove({ x, y }) {
        const distance = x.start - x.end

        this.scroll.target = this.scroll.start - distance
    }

    onTouchUp({ x, y }) {}

    /**
     * Loop
     */

    update(scroll) {
        const distance = (scroll.current - scroll.target) * 0.1
        const y = scroll.current / window.innerHeight

        if (this.scroll.current < this.scroll.target) {
            this.direction = "right"
            this.scroll.veloctiy = -1
        }
        else if (this.scroll.current > this.scroll.target) {
            this.direction = "left"
            this.scroll.veloctiy = 1
        }

        this.scroll.target -= this.scroll.veloctiy // Auto Scrolling
        this.scroll.target += distance

        this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, this.scroll.lerp)

        map(this.medias, (media, index) => {
            const scaleX = media.mesh.scale.x / 2 + 0.25 // (0.25) When the image should appear upon reaching screen end

            if (this.direction === "left") {
                const x = media.mesh.position.x + scaleX

                if (x < -this.sizes.width / 2) {
                    media.extra += this.width
                }
            }
            else if (this.direction === "right") {
                const x = media.mesh.position.x - scaleX

                if (x > this.sizes.width / 2) {
                    media.extra -= this.width
                }
            }

            media.update(this.scroll.current)
        })

        this.group.position.y = y * this.sizes.height
    }


    /**
     * Destroy
     */
    destroy() {
        this.scene.removeChild(this.group)
    }
}

// COMPLETE