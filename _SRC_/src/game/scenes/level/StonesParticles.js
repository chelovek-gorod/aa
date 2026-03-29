import { Particle, ParticleContainer } from "pixi.js"
import { tickerAdd, tickerRemove } from "../../../app/application"
import { images } from "../../../app/assets"
import { EventHub, events } from "../../../app/events"
import { ASTEROID_TYPE } from "./Asteroids"

const _2PI = Math.PI * 2

const SPREAD = 30
const SPREAD_2 = SPREAD * 2

const MAX_STONE_SIZE = 66

const MIN_IMAGE_INDEX = 1
const MAX_IMAGE_INDEX = 9
let imageIndex = MIN_IMAGE_INDEX - 1
function getImageIndex() {
    imageIndex++
    if (imageIndex > MAX_IMAGE_INDEX) imageIndex = MIN_IMAGE_INDEX
    return imageIndex
}

const STONE_COLORS = {
    [ASTEROID_TYPE.STONE] : 0xffffff,
    [ASTEROID_TYPE.ICE] : 0x73ccff,
    [ASTEROID_TYPE.FIRE] : 0xff0054,
}

function createStone() {
    const stone = new Particle({
        texture: images['asteroid_stone_' + getImageIndex()],
        x: 0,
        y: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 1,
        scaleY: 1,
        rotation: Math.random() * _2PI,
        alpha: 1
    })
    stone.data = {}
    return stone
}

export default class StonesParticles {
    constructor(scrollSpeedMs) {
        this.scrollSpeed = scrollSpeedMs * 0.5
        this.container = new ParticleContainer({
            dynamicProperties: {
                position: true,
                rotation: false,
                scale: false,
                alpha: true,
                color: true
            }
        })

        this.pool = []
        this.stones = []

        for (let i = 0; i < 60; i++) {
            this.pool.push(createStone())
        }

        // Границы удаления (будут установлены через resize)
        this.minX = -1000
        this.maxX = 1000
        this.minY = -1000
        this.maxY = 1000

        EventHub.on( events.addStones, this.addStones, this )
    }

    resize(width, height) {
        // Экран центрирован, координаты частиц относительно центра
        this.minX = (-width - MAX_STONE_SIZE) * 0.5
        this.maxX = (width + MAX_STONE_SIZE) * 0.5
        this.minY = (-height - MAX_STONE_SIZE) * 0.5
        this.maxY = (height + MAX_STONE_SIZE) * 0.5
    }

    // data = {x, y, type = ASTEROID_TYPE.STONE, count = 36}
    addStones(data) { 
        for (let i = 0; i < data.count; i++) {
            const stone = this.pool.length ? this.pool.pop() : createStone()
            stone.x = data.x - SPREAD + Math.random() * SPREAD_2
            stone.y = data.y - SPREAD + Math.random() * SPREAD_2
            stone.tint = STONE_COLORS[data.type]
            stone.rotation = Math.random() * _2PI
            stone.alpha = 1
            stone.data.gravity = 0.0009 + Math.random() * 0.0009
            const angle = Math.random() * _2PI
            stone.data.dx = Math.cos(angle)
            stone.data.dy = Math.sin(angle)
            stone.data.alphaDecay = 0.0003
            stone.data.deceleration = 0.99
            stone.data.speed = 0.3 + Math.random() * 0.3

            this.container.addParticle(stone)
            this.stones.push(stone)
        }

        if (this.stones.length) tickerAdd(this)
    }

    tick(deltaMs) {
        const stones = this.stones
        for (let i = stones.length - 1; i >= 0; i--) {
            const stone = stones[i]
            const data = stone.data

            stone.x += (data.dx * data.speed - this.scrollSpeed) * deltaMs
            stone.y += data.dy * data.speed * deltaMs
            data.dy += data.gravity * deltaMs

            data.speed *= data.deceleration

            stone.alpha = Math.max(0, stone.alpha - data.alphaDecay * deltaMs)

            if (stone.alpha <= 0 ||
                stone.x < this.minX || stone.x > this.maxX ||
                stone.y < this.minY || stone.y > this.maxY) {
                
                this.container.removeParticle(stone)
                this.pool.push(stone)
                
                stones[i] = stones[stones.length - 1]
                stones.pop()
            }
        }

        if (stones.length === 0) tickerRemove(this)
    }

    kill() {
        EventHub.off( events.addStones, this.addStones, this )
        tickerRemove(this)
        if (this.container) {
            this.container.destroy({ children: true })
            this.container = null
        }
        this.stones.length = 0
        this.pool.length = 0
        console.log('stones container killed')
    }
}