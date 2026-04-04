import { Container, TilingSprite, ColorMatrixFilter } from "pixi.js";
import { kill, tickerAdd, tickerRemove } from "../../../app/application";
import { images } from "../../../app/assets";
import { EventHub, events, shakeScreen, startScene } from "../../../app/events";
import { levelType, LEVEL_TYPE, playerSaves } from "../../state";
import { SCENE_NAME } from "../SceneManager";
import Asteroids from "./Asteroids";
import Clouds from "./Clouds";
import Obstacles from "./Obstacles";
import Player from "./Player";
import Smoke from "./Smoke";
import SnowParticles from "./SnowParticles";
import SparksParticles from "./SparksParticles";
import StonesParticles from "./StonesParticles";

const BG_WIDTH = 900
const BG_HEIGHT = 980
const BG_SIZE = 900 // эталонный размер для отличной отрисовки и ширины и высоты
const BG_TOP_SPEED_RATE = 0.66

export let timeScale = 1
let previousTimeScale = 1
const SLOW_DOWN_STEP = 0.0003
const SPEED_UP = 0.000006

export default class GameContainer extends Container {
    constructor(shaker) {
        super()

        timeScale = 1

        this.scrollSpeed = 0.66

        this.shaker = shaker

        this.isGamePaused = false

        this.bgBottom = new TilingSprite(images['bg_' + levelType.toLowerCase() + '_bottom'])
        this.bgBottom.anchor.set(0.5, 1)
        this.bgBottom.position.set(0, BG_HEIGHT * 0.5)
        this.addChild(this.bgBottom)

        this.bgTop = new TilingSprite(images['bg_' + levelType.toLowerCase() + '_top'])
        this.bgTop.anchor.set(0.5, 0)
        this.bgTop.position.set(0, -BG_HEIGHT * 0.5)
        this.addChild(this.bgTop)

        this.clouds = new Clouds(this.scrollSpeed)
        this.addChild(this.clouds)

        this.player = new Player(-300, -350, 150)

        this.obstacles = new Obstacles(this.scrollSpeed, this.player)
        this.addChild(this.obstacles)

        this.stones = new StonesParticles(this.scrollSpeed)
        this.addChild(this.stones.container)

        this.addChild(this.player)

        this.smokeContainer = new Smoke(this.scrollSpeed)
        this.addChild(this.smokeContainer)

        this.asteroids = new Asteroids(this.scrollSpeed, this.player)
        this.addChild(this.asteroids)

        this.sparks = new SparksParticles(this.scrollSpeed)
        this.addChild(this.sparks.container)

        if (levelType === LEVEL_TYPE.SNOW) {
            this.snow = new SnowParticles(this.scrollSpeed)
            this.addChild(this.snow.container)
        }
        
        EventHub.on( events.slowDown, this.slowDown, this )
        EventHub.on( events.pauseGameplay, this.pause, this )
        EventHub.on( events.resumeGameplay, this.resume, this )

        tickerAdd(this)
    }

    screenResize(screenData) {
        let scale = screenData.width / BG_SIZE
        if (screenData.isLandscape) scale = screenData.height / BG_SIZE

        const width = screenData.width / scale
        const height = screenData.height / scale

        this.bgTop.width = width
        this.bgBottom.width = width

        this.scale.set(scale)

        this.clouds.resize(width)
        this.obstacles.resize(width)
        this.asteroids.resize(width)
        this.stones.resize(width, height)
        this.sparks.resize(width, height)
        if (this.snow) this.snow.resize(screenData)
    }

    getFlyClick() {
        if (this.player && playerSaves >= 0) this.player.fly()
    }

    slowDown() {
        if (timeScale < 1) return

        timeScale = 0.999

        const sepiaFilter = new ColorMatrixFilter()
        sepiaFilter.sepia(true)
        this.filters = [sepiaFilter]
        shakeScreen({powerX: 50, powerY: 50})
    }

    pause() {
        this.isGamePaused = true
        previousTimeScale = timeScale
        timeScale = 0
        tickerRemove(this)

        const sepiaFilter = new ColorMatrixFilter()
        sepiaFilter.sepia(true)
        this.filters = [sepiaFilter]
    }
    resume() {
        this.isGamePaused = false
        if (previousTimeScale >= 1) this.filters = []

        timeScale = previousTimeScale
        tickerAdd(this)
    }

    tick(deltaMs) {
        if (timeScale < 1 && !this.isGamePaused) {
            timeScale = Math.max(0, timeScale - SLOW_DOWN_STEP * deltaMs)
            //timeScale = Math.max(0, timeScale - Math.sin(SLOW_DOWN_STEP * deltaMs))
            if (timeScale === 0) {
                //timeScale = 1
                tickerRemove(this)
                // kill(this)
                startScene(SCENE_NAME.Menu)
            }
        } else {
            timeScale += SPEED_UP * deltaMs
        }

        const scrollStep = this.scrollSpeed * deltaMs * timeScale

        this.bgTop.tilePosition.x -= Math.round(scrollStep * BG_TOP_SPEED_RATE)
        if (this.bgTop.tilePosition.x < -BG_WIDTH) this.bgTop.tilePosition.x += BG_WIDTH

        this.bgBottom.tilePosition.x -= Math.round(scrollStep)
        if (this.bgBottom.tilePosition.x < -BG_WIDTH) this.bgBottom.tilePosition.x += BG_WIDTH
    }

    kill() {
        EventHub.off( events.slowDown, this.slowDown, this )
        EventHub.off( events.pauseGameplay, this.pause, this )
        EventHub.off( events.resumeGameplay, this.resume, this )

        this.sparks.kill()
        this.sparks = null

        this.stones.kill()
        this.stones = null

        if (this.snow) {
            this.snow.kill()
            this.snow = null
        }
    }
}