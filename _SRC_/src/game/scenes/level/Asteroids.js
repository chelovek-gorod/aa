import { Container, Sprite } from "pixi.js";
import { tickerRemove, tickerAdd } from "../../../app/application";
import { images } from "../../../app/assets";
import { addExplosion, addScore, addSmoke, addSparks, addStones, shakeScreen, resetCombo } from "../../../app/events";
import { createEnum } from "../../../utils/functions";
import { timeScale } from "./GameContainer";
import { PLAYER_X, PLAYER_WIDTH } from "./Player";

const ASTEROID_WIDTH = 280
const START_X = (6200 + ASTEROID_WIDTH) * 0.5
const SPEED_RATE = 1.3
const MIN_Y = -300
const MAX_Y = 90
const MID_Y = MAX_Y - MIN_Y

const COLLIDE_LINE = (PLAYER_WIDTH + ASTEROID_WIDTH) * 0.5
const PLAYER_MIN_X = PLAYER_X - COLLIDE_LINE
const PLAYER_MAX_X = PLAYER_X + COLLIDE_LINE
// спрайт игрока 200x100px поэтому позволяем носу слегка погружаться (яко бы 100x100px)
const PLAYER_COLLIDE_R2 = Math.pow(ASTEROID_WIDTH * 0.5 + PLAYER_WIDTH * 0.25, 2)

// для взрыва
const SMOKE_COUNT = 7
const SMOKE_RADIUS = ASTEROID_WIDTH * 0.5 - 30
const smokeList = []
let smokeIndex = 0
for (let i = 0; i < 39; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = SMOKE_RADIUS * Math.sqrt(Math.random())
    const dx = Math.cos(angle) * r
    const dy = Math.sin(angle) * r
    smokeList.push({ x: dx, y: dy })
}

function addRadialSmoke(x, y) {
    for (let i = SMOKE_COUNT; i > 0; i--) {
        const point = smokeList[smokeIndex]
        smokeIndex++
        if (smokeIndex === smokeList.length) smokeIndex = 0

        addSmoke({x: x + point.x, y: y + point.y})
    }
}

export const ASTEROID_TYPE = createEnum(['STONE', 'ICE', 'FIRE'])
const IMAGES = {
    [ASTEROID_TYPE.STONE] : 'asteroid_1',
    [ASTEROID_TYPE.ICE] : 'asteroid_2',
    [ASTEROID_TYPE.FIRE] : 'asteroid_3',
}

const ASTEROIDS_LIST = [
    ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE,
    ASTEROID_TYPE.ICE,
    ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE,
    ASTEROID_TYPE.ICE, ASTEROID_TYPE.ICE,
    ASTEROID_TYPE.STONE, ASTEROID_TYPE.STONE,
    ASTEROID_TYPE.FIRE,
]
let asteroidIndex = 0

export default class Asteroids extends Container {
    constructor(scrollSpeed, player) {
        super()

        this.pull = []

        this.offset = 0
        this.scrollSpeed = scrollSpeed * SPEED_RATE

        this.player = player

        this.smokeContainer = new Container()
        this.addChild

        this.addAsteroidTimeout = 2400

        tickerAdd(this)
    }

    resize(width) {
        this.offset = (width + ASTEROID_WIDTH) * 0.5
    }

    addAsteroid() {
        const type = ASTEROIDS_LIST[asteroidIndex]
        asteroidIndex++
        if (asteroidIndex === ASTEROIDS_LIST.length) asteroidIndex = 0

        const asteroid = this.pull.length ? this.pull.pop() : new Sprite()
        asteroid.texture = images[IMAGES[type]]
        asteroid.anchor.set(0.5)
        asteroid.type = type
        asteroid.y = MIN_Y + MID_Y * Math.random()
        asteroid.x = START_X
        asteroid.speedRateX = type === ASTEROID_TYPE.FIRE ? 1.9 : type === ASTEROID_TYPE.ICE ? 1.6 : 1.3
        asteroid.score = type === ASTEROID_TYPE.FIRE ? 3 : type === ASTEROID_TYPE.ICE ? 2 : 1
        asteroid.tailSmokeTimeout = 128
        this.addChild(asteroid)
    }

    tick(deltaMs) {
        const scaledDeltaMs = deltaMs * timeScale

        const speed = this.scrollSpeed * scaledDeltaMs
        for (let a = this.children.length - 1; a >= 0; a--) {
            const asteroid = this.children[a]
            asteroid.x -= speed * asteroid.speedRateX
            asteroid.rotation -= 0.0009 * scaledDeltaMs
            if (asteroid.x < -this.offset) {
                this.removeChild(asteroid)
                this.pull.push(asteroid)
                resetCombo()
            }

            asteroid.tailSmokeTimeout -= scaledDeltaMs
            if (asteroid.tailSmokeTimeout <= 0) {
                asteroid.tailSmokeTimeout += 128
                addSmoke({x: asteroid.x, y: asteroid.y, asteroidTail: true})
            }

            if (asteroid.x > PLAYER_MIN_X && asteroid.x < PLAYER_MAX_X) {
                const dx = asteroid.x - this.player.x
                const dy = asteroid.y - this.player.y
                const d2 = dx * dx + dy * dy
                if (d2 < PLAYER_COLLIDE_R2) {
                    this.removeChild(asteroid)
                    this.pull.push(asteroid)

                    const spCount = 80 + Math.random() * 40
                    addSparks({x: asteroid.x, y: asteroid.y, isExplosion: true, count: spCount})
                    addStones({x: asteroid.x, y: asteroid.y, type: asteroid.type, count:36})
                    addExplosion({x: asteroid.x, y: asteroid.y})
                    shakeScreen({powerX: 12, powerY: 12})
                    addRadialSmoke(asteroid.x, asteroid.y)

                    addScore({score: asteroid.score, x: asteroid.x, y: asteroid.y, parent: this.parent})
                }
            }
        }

        this.addAsteroidTimeout -= scaledDeltaMs
        if (this.addAsteroidTimeout <= 0) {
            this.addAsteroidTimeout = 2400
            this.addAsteroid()
        }
    }

    kill() {
        tickerRemove(this)
        
        while(this.pull.length) {
            const asteroid = this.pull.pop()
            asteroid.destroy({children: true})
        }
        while(this.children.length) {
            const asteroid = this.children[0]
            this.removeChild(asteroid)
            asteroid.destroy({children: true})
        }
        while(this.smokeContainer.children.length) {
            const smoke = this.smokeContainer.children[0]
            this.smokeContainer.removeChild(smoke)
            smoke.destroy({children: true})
        }
        this.removeChild(this.smokeContainer)
        this.smokeContainer.destroy({children: true})
        this.smokeContainer = null
    }
}