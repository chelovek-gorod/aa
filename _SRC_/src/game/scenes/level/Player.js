import { Container, Sprite, MeshPlane } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../../app/application";
import { images, sounds } from "../../../app/assets";
import { addSmoke, addSparks, shakeScreen } from "../../../app/events";
import { soundPlay } from "../../../app/sound";
import { isWaterLevel, playerAvatarIndex, playerAvatarKeys } from "../../state";
import { timeScale } from "./GameContainer";

export const AVATARS = {
    player_1: {eye: 'player_eye_c', tongue: 'player_tongue_r'},
    player_2: {eye: 'player_eye_b', tongue: 'player_tongue_p'},
    player_3: {eye: 'player_eye_b', tongue: 'player_tongue_r'},
    player_4: {eye: 'player_eye_c', tongue: 'player_tongue_p'},
    player_5: {eye: 'player_eye_b', tongue: 'player_tongue_r'},
    player_6: {eye: 'player_eye_b', tongue: 'player_tongue_r'},
    player_7: {eye: 'player_eye_b', tongue: 'player_tongue_p'},
    player_8: {eye: 'player_eye_b', tongue: 'player_tongue_p'},
    player_9: {eye: 'player_eye_b', tongue: 'player_tongue_r'},
}

export const PLAYER_X = -300
export const PLAYER_WIDTH = 200

const GRAVITY = 0.0006
const FLY_POWER = 0.3

const ANGLE_FACTOR = 0.5
const ANGLE_SMOOTH = 0.009
const ANGLE_MAX = Math.PI * 0.5

const EYE_MAX_ANGLE = Math.PI * 0.3
const EYE_SPEED = 0.006
const EYE_MIN_TIME = 600
const EYE_MAX_TIME = 1200 
const EYE_MID_TIME = EYE_MAX_TIME -  EYE_MIN_TIME
const EYE_BLINK_SPEED = 0.0012

const SHAKE_POWER = 0.003

const TONGUE_SPEED = 0.009
const TONGUE_WAVELENGTH = 0.09
const TONGUE_AMPLITUDE = 4

const SMOKE = {
    pointX: -100,
    minY: -30,
    offsetY: 60,
    minTime: 64,
    midTime: 32,

    fallY: 60,
    fallMinX: - 90,
    fallMaxX: 140,
}

export default class Player extends Container {
    constructor(x, minY, maxY) {
        super()

        const AVA_KEY = playerAvatarKeys[playerAvatarIndex]

        this.shakePower = 0

        this.position.set(x, minY)

        this.body = new Sprite(images[AVA_KEY])
        this.body.anchor.set(0.5)
        this.addChild(this.body)

        this.eye = new Sprite(images[ AVATARS[AVA_KEY].eye ])
        this.eye.anchor.set(0.5)
        this.eye.position.set(32, -16)
        this.addChild(this.eye)
        this.eyeTargetAngle = 0
        this.eyeTimeout = EYE_MIN_TIME + EYE_MID_TIME * Math.random()

        this.tongue = new MeshPlane({
            texture: images[ AVATARS[AVA_KEY].tongue ],
            verticesX: 9,
            verticesY: 3
        })
        this.tongue.pivot.set(47, 7)
        this.tongue.position.set(26, 26)
        this.addChild(this.tongue)
        this.tongueOriginalVertices = this.tongue.geometry.getBuffer('aPosition').data.slice()
        this.tongueTime = 0

        this.minY = minY
        this.maxY = maxY

        this.flyPower = 0
        this.currentAngle = 0

        this.smokeTime = SMOKE.minTime + Math.random() * SMOKE.midTime

        tickerAdd(this)
    }

    fly() {
        this.flyPower += FLY_POWER
        this.shakePower = 0

        addSparks({x: this.x - 100, y: this.y, isExplosion: false, count: 12})

        for (let i = 12; i <= 0; i--) {
            const pointY = SMOKE.minY + Math.random() * SMOKE.offsetY
            addSmoke({x: this.x + SMOKE.pointX, y: this.y + pointY})
        }

        soundPlay(sounds.se_player_up.rate(0.8 + Math.random() * 0.4))
    }

    addSquash() {
        this.eye.scale.y = 0.18
        this.eye.rotation = 0
        this.eyeTimeout = EYE_MIN_TIME + EYE_MID_TIME * Math.random()
    }

    tick(deltaMs) {
        const scaledDeltaMs = deltaMs * timeScale

        // fly
        this.flyPower -= GRAVITY * scaledDeltaMs
        this.y -= this.flyPower * scaledDeltaMs

        let targetAngle = 0

        if (this.y > this.maxY) {
            this.y = this.maxY
            this.flyPower = 0
            this.rotation = 0
            if (this.shakePower > 0) {
                shakeScreen({powerX: this.shakePower, powerY: this.shakePower * 2})

                const fallSteps =  Math.ceil(this.shakePower * 2) + 1
                const step = (SMOKE.fallMaxX - SMOKE.fallMinX) / fallSteps
                const pointY = this.y + SMOKE.fallY
                for(let i = fallSteps; i > 0; i--) {
                    const pointX = this.x + SMOKE.fallMaxX - step * i
                    addSmoke({x: pointX, y: pointY})
                }

                this.shakePower = 0
                soundPlay(sounds.se_fall.rate(isWaterLevel ? 0.5 : 1))
            }
        } else if(this.y < this.minY) {
            this.y = this.minY
            this.flyPower = 0
            this.rotation = 0
        } else {
            this.shakePower += SHAKE_POWER * scaledDeltaMs
            targetAngle = -this.flyPower * ANGLE_FACTOR
            targetAngle = Math.min(ANGLE_MAX, Math.max(-ANGLE_MAX, targetAngle))
        }

        this.currentAngle += (targetAngle - this.currentAngle) * ANGLE_SMOOTH * scaledDeltaMs
        this.rotation = this.currentAngle

        // eye
        if (this.eye.scale.y < 1) {
            this.eye.scale.y = Math.min(1, this.eye.scale.y + EYE_BLINK_SPEED * scaledDeltaMs)
        } else if (this.eyeTimeout > 0) {
            this.eyeTimeout -= scaledDeltaMs
            if (this.eyeTimeout <= 0) {
                this.eyeTargetAngle = -EYE_MAX_ANGLE + Math.random() * (EYE_MAX_ANGLE * 2)
            }
        } else {
            const eyeSpeed = EYE_SPEED * scaledDeltaMs
            if (this.eye.rotation < this.eyeTargetAngle) {
                this.eye.rotation = Math.min(this.eyeTargetAngle, this.eye.rotation + eyeSpeed)
            } else if (this.eye.rotation > this.eyeTargetAngle) {
                this.eye.rotation = Math.max(this.eyeTargetAngle, this.eye.rotation - eyeSpeed)
            } else {
                this.eyeTimeout = EYE_MIN_TIME + EYE_MID_TIME * Math.random()
            }
        }

        // tongue
        this.tongueTime += TONGUE_SPEED * scaledDeltaMs
    
        const geometry = this.tongue.geometry
        const vertices = geometry.getBuffer('aPosition').data
        const originalVertices = this.tongueOriginalVertices
        
        // Проходим по сетке вершин и создаем эффект "колыхания"
        for (let i = 0; i < vertices.length; i += 2) {
            const ox = originalVertices[i]
            const oy = originalVertices[i + 1]

            const angleX = this.tongueTime * 0.2 + (oy * TONGUE_WAVELENGTH)
            const angleY = this.tongueTime * 0.7 + (ox * TONGUE_WAVELENGTH)

            // Используем нормализованные смещения
            vertices[i] = ox + Math.sin(angleX) * TONGUE_AMPLITUDE
            vertices[i + 1] = oy + Math.cos(angleY) * TONGUE_AMPLITUDE
        }
        geometry.getBuffer('aPosition').update()

        // smoke
        this.smokeTime -= scaledDeltaMs
        if (this.smokeTime <= 0) {
            if (this.flyPower > 0) {
                const pointY = SMOKE.minY + Math.random() * SMOKE.offsetY
                addSmoke({x: this.x + SMOKE.pointX, y: this.y + pointY})
            }

            if (this.y === this.maxY) {
                const pointX = -75 + Math.random() * 150
                addSmoke({x: this.x + pointX, y: this.y + SMOKE.fallY})
                shakeScreen({powerX: 2, powerY: 2})
            }
            
            this.smokeTime = SMOKE.minTime + Math.random() * SMOKE.midTime
        }
    }
}