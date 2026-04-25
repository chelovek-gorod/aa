import { Container, Sprite } from 'pixi.js'
import { kill, tickerAdd, tickerRemove } from '../../../app/application'
import { atlases, images, sounds } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import MenuUI from '../../UI/MenuUI'
import { SCENE_NAME } from '../SceneManager'
import { BUTTON_TYPE, FLY_MESSAGE_TYPE, TEXT_FLY_MESSAGE } from '../../localText'
import FlashButton, { FLASH_TYPE } from '../../UI/FlashButton'
import FlyText from '../level/FlyText'
import { getLanguage } from '../../localization'
import { freeSpinTime, playerAddCoins, playerAddSave, setFreeSpinTime } from '../../state'
import { showRewardAdSDK } from '../../storage'
import Popup, { POPUP_TYPE } from '../../popup/Popup'
import { soundPlay } from '../../../app/sound'
import FireworkParticles from '../../popup/Firework'
import { EventHub, events } from '../../../app/events'

const OFFSET_Y = 120
const OFFSET_X = 30

const SIZE = 620

const CLICK_TIMEOUT = 600

const AUTO_STOP_TIME = 6000

const WHEEL_SPEED = 0.012
const FRICTION = 0.976        // коэффициент замедления
const MIN_SPEED = 0.0018      // порог, ниже которого проверяем сектор

const ALLOWED_SECTORS = new Set([0, 3, 4, 7, 8, 11, 12, 15, 16, 19])
const SECTOR_ANGLE = (Math.PI * 2) / 20

export default class WheelScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.mainContainer.eventMode = 'static'
        this.mainContainer.on('pointerdown', this.getWheelClick, this)
        this.addChild(this.mainContainer)

        this.speed = 0
        this.clickTimeout = 0
        this.autoStopTimer = 0

        this.wheelDisc = new Sprite(atlases.ui.textures.wheel_disc)
        this.wheelDisc.anchor.set(0.5)
        this.wheelDisc.rotation = Math.random() * (Math.PI * 2)
        this.mainContainer.addChild(this.wheelDisc)

        this.wheelBorder = new Sprite(atlases.ui.textures.wheel_border)
        this.wheelBorder.anchor.set(0.5)
        this.mainContainer.addChild(this.wheelBorder)

        this.adButton = new FlashButton(FLASH_TYPE.WHEEL, this.rotateWheel.bind(this), 0.05)
        this.adButton.position.set(0, 120)
        this.adButton.setStartScale(0)
        this.mainContainer.addChild(this.adButton)

        this.ui = new MenuUI(this, SCENE_NAME.Menu, BUTTON_TYPE.STOP, this.stopWheel.bind(this))
        this.addChild(this.ui)

        this.firework = new FireworkParticles(true)
        this.addChild(this.firework.container)

        this.popup = new Popup()
        this.addChild(this.popup)

        if (freeSpinTime === 0) {
            this.popup.show(POPUP_TYPE.FREE_SPIN)
            soundPlay(sounds.se_free_spin)
        } else {
            setTimeout( () => this.startFirstSpin(false), 1 )
        }

        EventHub.on( events.freeSpinPopupClosed, this.startFirstSpin, this )
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)
        this.ui.screenResize(screenData)
        this.popup.screenResize(screenData)
        this.firework.resize(screenData.width, screenData.height)

        const widthRate = screenData.width / screenData.height

        const width = screenData.width - OFFSET_X * 2
        const height = screenData.height - (widthRate > 2 ? OFFSET_Y * 1.5 : OFFSET_Y * 2)

        const scaleX = Math.min(1, width / SIZE)
        const scaleY = Math.min(1, height / SIZE)
        this.mainContainer.scale.set(Math.min(scaleX, scaleY))
        this.mainContainer.position.set(0, widthRate > 1 ? -36 : 0)
    }

    startFirstSpin(isFree = true) {
        if (isFree) setFreeSpinTime()

        this.speed = WHEEL_SPEED
        this.clickTimeout = CLICK_TIMEOUT
        this.autoStopTimer = AUTO_STOP_TIME

        tickerAdd(this)
    }

    rotateWheel() {
        if (this.speed > 0 || this.adButton.scale.x < 1) return

        let done = false
        showRewardAdSDK( (isOk) => {
            if (done) return

            if (isOk) {
                done = true
                
                this.adButton.setStartScale(0)
                this.wheelDisc.tint = null
                this.wheelBorder.tint = null

                this.ui.resetButton(BUTTON_TYPE.STOP, SCENE_NAME.Menu, this.stopWheel.bind(this))

                this.speed = WHEEL_SPEED
                this.clickTimeout = CLICK_TIMEOUT
                this.autoStopTimer = AUTO_STOP_TIME

                tickerAdd(this)
            } else {
                const message = TEXT_FLY_MESSAGE[FLY_MESSAGE_TYPE.ERROR][getLanguage()]
                this.addChild( new FlyText(message, 0, 0, false) )
            }
        })
    }

    getWheelClick() {
        if (this.speed !== WHEEL_SPEED || this.clickTimeout > 0) return

        this.stopWheel()
        soundPlay(sounds.se_hover)
    }

    stopWheel() {
        if (this.speed !== WHEEL_SPEED || this.clickTimeout > 0) return

        this.ui.startButton.setActive(false)
        this.speed *= FRICTION
        this.autoStopTimer = 0
    }

    onWheelStopped(currentSector) {
        this.ui.startButton.setActive(true)
        this.ui.resetButton(BUTTON_TYPE.BACK, SCENE_NAME.Menu)
        // Здесь можно добавить логику награды за выпавший сектор
        // console.log('Wheel stopped at sector:', currentSector)
        let coins = 0
        switch(currentSector) {
            case 19 :
            case 0 : coins = 3; break
            case 11 :
            case 12 :
            case 3 : 
            case 4 : coins = 5; break
            case 7 : 
            case 8 : coins = 7; break
        }

        if (coins === 0) {
            const message = TEXT_FLY_MESSAGE[FLY_MESSAGE_TYPE.GET_SAVE][getLanguage()]
            this.addChild( new FlyText(message, 0, 0, false) )
            playerAddSave()
            this.ui.updateSaves()
            soundPlay(sounds.se_save)
        } else {
            const message = TEXT_FLY_MESSAGE[FLY_MESSAGE_TYPE.GET_COINS][getLanguage()](coins)
            this.addChild( new FlyText(message, 0, 0, false) )
            playerAddCoins(coins)
            this.ui.updateCoins()
            soundPlay(sounds.se_coins)
        }

        this.adButton.setStartScale(1)
        this.wheelDisc.tint = 0x333333
        this.wheelBorder.tint = 0x333333

        this.firework.launch({
            point: {x: 0, y: this.height * 0.1},
            offset: {x: this.width * 0.1, y: this.height * 0.05},
            count: 18, sparks: 120
        })
        soundPlay(sounds.se_fireworks)
    }

    getCurrentSector() {
        // Нормализуем угол в диапазон [0, 2π)
        let angle = this.wheelDisc.rotation % (Math.PI * 2)
        if (angle < 0) angle += Math.PI * 2
        return Math.floor(angle / SECTOR_ANGLE)
    }

    tick(deltaMs) {
        if (this.speed === 0) return

        if (this.clickTimeout > 0) this.clickTimeout -= deltaMs

        if (this.speed === WHEEL_SPEED && this.autoStopTimer > 0) {
            this.autoStopTimer -= deltaMs
            if (this.autoStopTimer <= 0) this.stopWheel()
        }

        this.wheelDisc.rotation += this.speed * deltaMs

        if (this.speed < WHEEL_SPEED) {
            this.speed *= FRICTION

            if (this.speed < MIN_SPEED) {
                const currentSector = this.getCurrentSector()
                if (ALLOWED_SECTORS.has(currentSector)) {
                    this.speed = 0
                    this.onWheelStopped(currentSector)
                } else {
                    this.speed = MIN_SPEED
                }
            }
        }
    }

    kill() {
        tickerRemove(this)
        this.mainContainer.off('pointerdown', this.stopWheel, this)
        EventHub.off( events.freeSpinPopupClosed, this.startFirstSpin, this )

        this.firework.kill()
        this.firework = null
    }
}