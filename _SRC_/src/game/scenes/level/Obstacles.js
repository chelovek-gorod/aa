import { Container, Sprite } from "pixi.js";
import { tickerRemove, tickerAdd, kill } from "../../../app/application";
import { images } from "../../../app/assets";
import { addExplosion, addSmoke, addSparks, resetCombo, shakeScreen, slowDown } from "../../../app/events";
import { createEnum } from "../../../utils/functions";
import { timeScale } from "./GameContainer";
import { PLAYER_X, PLAYER_WIDTH } from "./Player";

const START_X = 6200 * 0.5
const BUS_Y = 250
const BUILDING_Y = 190
const AIR_MIN_Y = -400
const AIR_MAX_Y = 80
const COPTER_MIN_Y = -400
const COPTER_MAX_Y = 0

const OBSTACLE_TYPE = createEnum(['BUS', 'BUILDING', 'PLANE', 'AIRSHIP', 'COPTER', 'AEROSTAT'])
const OBSTACLE_LIST = [
    OBSTACLE_TYPE.PLANE, OBSTACLE_TYPE.BUILDING, OBSTACLE_TYPE.AIRSHIP, OBSTACLE_TYPE.BUS,
    OBSTACLE_TYPE.COPTER, OBSTACLE_TYPE.BUILDING, OBSTACLE_TYPE.PLANE, OBSTACLE_TYPE.BUS,
    OBSTACLE_TYPE.AEROSTAT, OBSTACLE_TYPE.BUILDING,
]
let obstacleIndex = 0
let buildingIndex = 1

const BUS_COLLIDERS = [
    {x: -46, y: -87, r2: Math.pow(150 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 66, y: -87, r2: Math.pow(150 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]
const BUILDING_COLLIDERS = [
    {x: 0, y: -190, r2: Math.pow(100 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 0, y: -100, r2: Math.pow(120 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]
const PLANE_COLLIDERS = [
    {x: -87, y: 72, r2: Math.pow(80 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: -12, y: 90, r2: Math.pow(100 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 84, y: 72, r2: Math.pow(50 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]
const AIRSHIP_COLLIDERS = [
    {x: -75, y: 68, r2: Math.pow(120 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: -14, y: 92, r2: Math.pow(160 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 89, y: 77, r2: Math.pow(80 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]
const COPTER_COLLIDERS = [
    {x: -45, y: 66, r2: Math.pow(130 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 84, y: 58, r2: Math.pow(80 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]
const AEROSTAT_COLLIDERS = [
    {x: 0, y: 64, r2: Math.pow(130 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
    {x: 0, y: 140, r2: Math.pow(50 * 0.5 + PLAYER_WIDTH * 0.25, 2)},
]

class Bus extends Sprite {
    constructor() {
        super(images.bus)
        this.anchor.set(0.5, 1)

        this.speedRateX = 1
        this.isAlive = true

        this.halfWidth = images.bus.width * 0.5
        this.position.set(START_X + this.halfWidth, BUS_Y)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = BUS_COLLIDERS

        this.smokeTimeout = 128
        this.isSmokeLeft = true
    }

    setDamage() {
        this.isAlive = false
        this.texture = images.bus_black

        addSparks({x: this.x - 70, y: this.y - 75, isExplosion: true, count: 16})
        addSparks({x: this.x + 70, y: this.y - 75, isExplosion: true, count: 16})
        addExplosion({x: this.x, y: this.y - 75})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 128
            this.isSmokeLeft = !this.isSmokeLeft
            addSmoke({x: this.isSmokeLeft ? this.x - 100 : this.x + 100, y: this.y - 75})
        }
    }
}

class Building extends Sprite {
    constructor() {
        super(images['building_' + buildingIndex])
        this.anchor.set(0.5, 1)
        this.buildingIndex = buildingIndex

        buildingIndex++
        if (buildingIndex > 3) buildingIndex = 1

        this.speedRateX = 0.7
        this.isAlive = true

        this.halfWidth = images['building_' + this.buildingIndex].width * 0.5
        this.position.set(START_X + this.halfWidth, BUILDING_Y)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = BUILDING_COLLIDERS

        this.smokeTimeout = 128
        this.isSmokeTop = true
    }

    setDamage() {
        this.isAlive = false
        this.texture = images['building_' + this.buildingIndex + '_black']

        addSparks({x: this.x, y: this.y - 100, isExplosion: true, count: 16})
        addSparks({x: this.x, y: this.y - 190, isExplosion: true, count: 16})
        addExplosion({x: this.x, y: this.y - 160})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 128
            this.isSmokeTop = !this.isSmokeTop
            addSmoke({x: this.x, y: this.isSmokeTop ? this.y - 190 : this.y - 100})
        }
    }
}

class Plane extends Sprite {
    constructor() {
        super(images.plane)
        this.anchor.set(0.5, 0)

        this.speedRateX = 1.7
        this.isAlive = true

        this.halfWidth = images.plane.width * 0.5
        this.position.set(START_X + this.halfWidth, AIR_MIN_Y)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = PLANE_COLLIDERS

        this.smokeTimeout = 64
        this.smokePoint = 0
    }

    fly(deltaMs) {
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout = 64
            addSmoke({x: this.x + 100, y: this.y + 100})
        }
    }

    setDamage() {
        this.isAlive = false
        this.texture = images.plane_black
        this.rotation -= 0.3

        addSparks({x: this.x - 90, y: this.y + 60, isExplosion: true, count: 16})
        addSparks({x: this.x + 50, y: this.y + 80, isExplosion: true, count: 16})
        addExplosion({x: this.x - 50, y: this.y + 80})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.y += 0.3 * deltaMs
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 64
            addSmoke({x: this.x + this.colliders[this.smokePoint].x, y: this.y + this.colliders[this.smokePoint].y})
            this.smokePoint++
            if (this.smokePoint === this.colliders.length) this.smokePoint = 0
        }
    }
}

class Airship extends Sprite {
    constructor() {
        super(images.airship)
        this.anchor.set(0.5, 0)

        this.speedRateX = 0.7
        this.isAlive = true

        this.halfWidth = images.airship.width * 0.5
        this.position.set(START_X + this.halfWidth, AIR_MIN_Y)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = AIRSHIP_COLLIDERS

        this.smokeTimeout = 64
        this.smokePoint = 0
    }

    setDamage() {
        this.isAlive = false
        this.texture = images.airship_black
        this.rotation -= 0.2

        addSparks({x: this.x - 80, y: this.y + 70, isExplosion: true, count: 16})
        addSparks({x: this.x + 60, y: this.y + 80, isExplosion: true, count: 16})
        addExplosion({x: this.x - 20, y: this.y + 90})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.y += 0.4 * deltaMs
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 64
            addSmoke({x: this.x + this.colliders[this.smokePoint].x, y: this.y + this.colliders[this.smokePoint].y})
            this.smokePoint++
            if (this.smokePoint === this.colliders.length) this.smokePoint = 0
        }
    }
}

class Copter extends Sprite {
    constructor() {
        super(images.copter)
        this.anchor.set(0.5, 0)

        this.speedRateX = 0.9
        this.isAlive = true

        this.amp = (COPTER_MAX_Y - COPTER_MIN_Y) * 0.5
        this.offset = (COPTER_MIN_Y + COPTER_MAX_Y) * 0.5
        // выбираем начальное направление (снизу вверх  /  сверху вниз)
        this.phase = Math.random() < 0.5 ? Math.PI * 0.5 : Math.PI * 1.5
        this.phaseSpeed = 0.0012
        this.maxAngle = Math.PI * 0.25 

        this.halfWidth = images.copter.width * 0.5
        this.position.set(START_X + this.halfWidth, COPTER_MIN_Y)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = COPTER_COLLIDERS

        this.smokeTimeout = 96
        this.smokePoint = 0
    }

    fly(deltaMs) {
        this.phase += this.phaseSpeed * deltaMs
        if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2

        this.y = this.offset + Math.sin(this.phase) * this.amp

        let targetAngle = -Math.cos(this.phase) * this.maxAngle
        this.rotation = Math.min(this.maxAngle, Math.max(-this.maxAngle, targetAngle))
    }

    setDamage() {
        this.isAlive = false
        this.texture = images.copter_black
        this.rotation -= 0.35

        addSparks({x: this.x - 40, y: this.y + 50, isExplosion: true, count: 16})
        addSparks({x: this.x + 70, y: this.y + 70, isExplosion: true, count: 16})
        addExplosion({x: this.x - 20, y: this.y + 100})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.y += 0.3 * deltaMs
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 96
            addSmoke({x: this.x + this.colliders[this.smokePoint].x, y: this.y + this.colliders[this.smokePoint].y})
            this.smokePoint++
            if (this.smokePoint === this.colliders.length) this.smokePoint = 0
        }
    }
}

class Aerostat extends Sprite {
    constructor() {
        super(images.aerostat)
        this.anchor.set(0.5, 0)

        this.speedRateX = 0.5
        this.isAlive = true

        this.maxY = AIR_MAX_Y - images.aerostat.height
        this.isMoveUp = Math.random() < 0.5

        this.halfWidth = images.aerostat.width * 0.5
        this.position.set(START_X + this.halfWidth, AIR_MIN_Y + (this.maxY - AIR_MIN_Y) * 0.5)

        this.playerMinX = PLAYER_X - this.halfWidth
        this.playerMaxX = PLAYER_X + this.halfWidth
        this.colliders = AEROSTAT_COLLIDERS

        this.smokeTimeout = 96
        this.smokePoint = 0
    }

    fly(deltaMs) {
        const flySpeed = 0.06 * deltaMs
        if (this.isMoveUp) {
            this.y = Math.max(AIR_MIN_Y, this.y - flySpeed)
            if (this.y === AIR_MIN_Y) this.isMoveUp = false
        } else {
            this.y = Math.min(this.maxY, this.y + flySpeed)
            if (this.y === this.maxY) this.isMoveUp = true
        }
    }

    setDamage() {
        this.isAlive = false
        this.texture = images.aerostat_black

        addSparks({x: this.x, y: this.y + 55, isExplosion: true, count: 16})
        addSparks({x: this.x, y: this.y + 140, isExplosion: true, count: 8})
        addExplosion({x: this.x, y: this.y + 60})
        shakeScreen({powerX: 12, powerY: 12})
    }

    destroyedMove(deltaMs) {
        this.y += 0.4 * deltaMs
        this.smokeTimeout -= deltaMs
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += 96
            addSmoke({x: this.x + this.colliders[this.smokePoint].x, y: this.y + this.colliders[this.smokePoint].y})
            this.smokePoint++
            if (this.smokePoint === this.colliders.length) this.smokePoint = 0
        }
    }
}

export default class Obstacles extends Container {
    constructor(scrollSpeed, player) {
        super()

        this.player = player

        this.offset = 0
        this.scrollSpeed = scrollSpeed

        this.addTimeout = 1769

        tickerAdd(this)
    }

    resize(width) {
        this.offset = width
    }

    addObstacle() {
        const obstacleKey = OBSTACLE_LIST[obstacleIndex]
        obstacleIndex++
        if (obstacleIndex === OBSTACLE_LIST.length) obstacleIndex = 0

        switch(obstacleKey) {
            case OBSTACLE_TYPE.BUS : this.addChild( new Bus() ); break;
            case OBSTACLE_TYPE.AEROSTAT : this.addChild( new Aerostat() ); break;
            case OBSTACLE_TYPE.AIRSHIP : this.addChild( new Airship() ); break;
            case OBSTACLE_TYPE.BUILDING : this.addChild( new Building() ); break;
            case OBSTACLE_TYPE.COPTER : this.addChild( new Copter() ); break;
            case OBSTACLE_TYPE.PLANE : this.addChild( new Plane() ); break;
        }
    }

    tick(deltaMs) {
        const scaledDeltaMs = deltaMs * timeScale
        const scrollSpeed = this.scrollSpeed * scaledDeltaMs

        let collideObstaclesList = []
        
        for (let o = this.children.length - 1; o >= 0; o--) {
            const obstacle = this.children[o]

            obstacle.x -= scrollSpeed * obstacle.speedRateX
            if (obstacle.x + obstacle.halfWidth < -this.offset) {
                this.removeChild(obstacle)
                kill(obstacle)
            }

            if('buildingIndex' in obstacle && this.player.y === this.player.maxY) continue

            if('fly' in obstacle && obstacle.isAlive) obstacle.fly(scaledDeltaMs)

            if (obstacle.isAlive) {
                if (obstacle.x > obstacle.playerMinX && obstacle.x < obstacle.playerMaxX) {
                    for(let i = obstacle.colliders.length - 1; i >= 0; i--) {
                        const collider = obstacle.colliders[i]
                        const dx = obstacle.x + collider.x - this.player.x
                        const dy = obstacle.y + collider.y - this.player.y
                        const d2 = dx * dx + dy * dy
                        if (d2 < collider.r2) collideObstaclesList.push(obstacle)
                    }
                }
            } else {
                obstacle.destroyedMove(scaledDeltaMs)
            }
        }

        if (collideObstaclesList.length) {
            resetCombo()
            slowDown()
        }
        
        while (collideObstaclesList.length) {
            const obstacle = collideObstaclesList.pop()
            obstacle.setDamage()
        }

        this.addTimeout -= scaledDeltaMs
        if (this.addTimeout <= 0) {
            this.addTimeout += 1769
            this.addObstacle()
        }
    }

    kill() {
        tickerRemove(this)

        while(this.children.length) {
            const asteroid = this.children[0]
            this.removeChild(asteroid)
            asteroid.destroy({children: true})
        }
    }
}