// The Backend 
require("dotenv").config() // Requests the file and configures everything for you

const logger = require("morgan")
const express = require("express")
const errorHandler = require("errorhandler")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
const port = 3000
const path = require("path")

app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(errorHandler())
app.use(methodOverride()) 
app.use(express.static(path.join(__dirname, "public"))) // The Public Folder will be our Static Folder.

const Prismic = require("@prismicio/client")
const PrismicDOM = require("prismic-dom")
const UAParser = require("ua-parser-js")

const initApi = req => {
    return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        req
    })
}

const HandleLinkResolver = (doc) => {
    if (doc.type == "product") {
        return `/detail/${doc.slug}`
    }

    if (doc.type == "collections") {
        return `/collections`
    }

    if (doc.type == "about") {
        return `/about`
    }

    return "/";
}

app.use((req, res, next) => {
    const ua = UAParser(req.headers["user-agent"])

    res.locals.isDesktop = ua.device.type === undefined
    res.locals.isPhone = ua.device.type === "mobile"
    res.locals.isTablet = ua.device.type === "tablet"

    res.locals.Link = HandleLinkResolver

    res.locals.Numbers = index => {
        return index == 0 ? "One" : index == 1 ? "Two" : index == 2 ? "Three" : index == 3 ? "Four" : "";
    }

    res.locals.PrismicDOM = PrismicDOM;

    next()
})

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

const handleRequest = async api => {
    const about = await api.getSingle("about")
    const home = await api.getSingle("home")
    const meta = await api.getSingle("meta")
    const navigation = await api.getSingle("navigation")
    const preloader = await api.getSingle("preloader")

    const { results: collections } = await api.query(Prismic.Predicates.at("document.type", "collection"), {
        fetchLinks: "product.image"
    })

    const assets = []

    home.data.gallery.forEach(item => {
        assets.push(item.image.url)
    })

    about.data.gallery.forEach(item => {
        assets.push(item.image.url)
    })

    about.data.body.forEach(section => {
        if (section.slice_type === "gallery") {
            section.items.forEach(item => {
                assets.push(item.image.url)
            })
        }
    })

    collections.forEach(collection => {
        collection.data.products.forEach(item => {
            assets.push(item.products_product.data.image.url)
            
        })
    })

    return {
        about,
        assets,
        collections,
        home,
        meta,
        navigation,
        preloader
    }
}

app.get("/", async (req, res) => {
    const api = await initApi(req)
    const defaults = await handleRequest(api)

    res.render("pages/home", {
        ...defaults,
    })
})

app.get("/about", async (req, res) => {
    // Fetching the pages using the API, 
    // Checks if the document type matches the about page
    const api = await initApi(req)
    const defaults = await handleRequest(api)

    res.render("pages/about", {
        ...defaults,
    })
})

app.get("/collections", async (req, res) => {
    const api = await initApi(req)
    const defaults = await handleRequest(api)

    res.render("pages/collections", {
        ...defaults,
    })
})

// Base Must be Included to stop Duplicate REQUESTS
app.get("/detail/:uid", async (req, res) => {
    const api = await initApi(req)
    const defaults = await handleRequest(api)

    const product = await api.getByUID("product", req.params.uid, {
        fetchLinks: "collection.title"
    })

    res.render("pages/detail", {
        ...defaults,
        product
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
