import { Container, Sprite } from "pixi.js";
import { tickerAdd } from "../../../app/application";
import { images } from "../../../app/assets";
import { timeScale } from "./GameContainer";

const CLOUD_WIDTH = 326
const SPEED_RATE_MIN = 0.7
const SPEED_RATE_MAX = 1.1
const SPEED_RATE_MID = SPEED_RATE_MAX - SPEED_RATE_MIN
const MIN_Y = 250
const MAX_Y = 350
const MID_Y = MAX_Y - MIN_Y
const SCALE_MIN = 0.5
const SCALE_MAX = 1
const SCALE_MID = SCALE_MAX - SCALE_MIN
const ALPHA_MIN = 0.4
const ALPHA_MAX = 0.8
const ALPHA_MID = ALPHA_MAX - ALPHA_MIN

export default class Clouds extends Container {
    constructor(scrollSpeed) {
        super()

        this.offset = 0
        this.scrollSpeed = scrollSpeed

        tickerAdd(this)
    }

    resize(width) {
        this.offset = width * 0.5 + CLOUD_WIDTH
        if (this.children.length === 0) {
            const step = width / 4
            for (let i = 8; i > 0; i--) {
                const cloud = new Sprite(images['cloud_' + (i % 4 + 1)])
                const x = -this.offset + i * step + step * Math.random()
                const y = MIN_Y + MID_Y * Math.random()
                cloud.position.set(x, -y)
                cloud.anchor.set(0.5)
                cloud.speed = this.scrollSpeed * (SPEED_RATE_MIN + SPEED_RATE_MID * Math.random())
                cloud.alpha = ALPHA_MIN + ALPHA_MID * Math.random()
                cloud.scale.set( SCALE_MIN + SCALE_MID * Math.random() )
                this.addChild( cloud )
            }
        }
    }

    resetCloud(cloud) {
        cloud.speed = this.scrollSpeed * (SPEED_RATE_MIN + SPEED_RATE_MID * Math.random())
        cloud.y = -MIN_Y + -MID_Y * Math.random()
        cloud.x = this.offset + CLOUD_WIDTH
        cloud.alpha = ALPHA_MIN + ALPHA_MID * Math.random()
        cloud.scale.set( SCALE_MIN + SCALE_MID * Math.random() )
    }

    tick(deltaMs) {
        for (let c = this.children.length - 1; c >= 0; c--) {
            const cloud = this.children[c]
            cloud.x -= cloud.speed * deltaMs * timeScale
            if (cloud.x < -this.offset - CLOUD_WIDTH) {
                this.resetCloud(cloud)
            }
        }
    }
}