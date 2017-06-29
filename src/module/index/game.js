import {
    Application,
    Container,
    loader,
    Sprite
} from 'pixi.js'

let game

let stateContainer = {
    __states: {},
    __active: {
        state: null,
        update() {}
    },
    add(name, state) {
        if (this.__states[name]) console.warn(`${name} state has registered, please rename it`)
        this.__states[name] = state
    },
    start(name) {
        game.stage.removeChildren()
        game.ticker.remove(this.__active.update, this.__active.state)

        const ActiveState = this.__states[name]
        const activeState = new ActiveState()
        game.ticker.add(activeState.update, activeState)
        game.stage.addChild(activeState)
        this.__active.update = activeState.update
        this.__active.state = activeState
    }
}

class Game extends Application {
    constructor(...opt) {
        super(...opt)
        game = this
        this.state = stateContainer
    }
}

class State extends Container {
    constructor() {
        super()
        this.state = stateContainer

        let __hasLoad = false
        const loaderAdd = loader.add
        loader.add = (name, path, option, cb) => {
            __hasLoad = true
            loaderAdd.call(loader, name, path, option, cb)
        }
        this.loader = loader

        this.init()
        this.preload()

        let __resources = {}
        this.loader.load((loaders, resources) => {
            __resources = resources
            this.create()
        })
        this.add = name => {
            if (typeof name === 'string') {
                this.addChild( new Sprite(__resources[name].texture))
                return
            }
            this.addChild(name)
        }

        if(__hasLoad) return
        this.create()
    }
    init() {}
    preload() {}
    create(loaders, resources) {}
    update() {}
}

export {
    Game,
    State
}