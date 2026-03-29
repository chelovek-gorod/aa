import { Container, Graphics } from 'pixi.js'
import { music } from '../../../app/assets'
import { EventHub, events } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { getLanguage } from '../../localization'
import Shaker from './Shaker'
import GameContainer from './GameContainer'
import UI from './UI'
import { tickerAdd, tickerRemove } from '../../../app/application'
import { playerSaves } from '../../state'

export default class LevelScene extends Container {
    constructor() {
        super()

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.shaker = new Shaker()
        this.addChild(this.shaker)

        this.gameContainer = new GameContainer(this.shaker)
        this.shaker.addChild(this.gameContainer)

        this.tapArea = new Graphics()
        this.tapArea.alpha = 0.0003
        this.tapArea.eventMode = 'static'
        this.tapArea.cursor = 'pointer'
        this.tapArea.on('pointerdown', this.getFlyClick, this)
        this.addChild(this.tapArea)

        this.tapAreaColor = 0x000000
        this.redSpeed = 0.006
        this.redIsUp = true
        this.tapAreaDrawData = {x: 0, y: 0, w: 0, h: 0}

        this.UI = new UI(this.gameContainer)
        this.addChild(this.UI)

        EventHub.on( events.showRedScreen, this.showRedScreen, this )
        
        setMusicList([ music.bgm_0, music.bgm_1, music.bgm_2, music.bgm_3, music.bgm_4 ])
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.UI.screenResize(screenData)

        this.tapAreaDrawData.x = -screenData.centerX
        this.tapAreaDrawData.y = -screenData.centerY
        this.tapAreaDrawData.w = screenData.width
        this.tapAreaDrawData.h = screenData.height
        this.redrawTapArea()
        
        this.shaker.screenResize(screenData)
    }

    redrawTapArea() {
        this.tapArea.clear()
        this.tapArea.rect(
            this.tapAreaDrawData.x, this.tapAreaDrawData.y,
            this.tapAreaDrawData.w, this.tapAreaDrawData.h
        )
        this.tapArea.fill(this.tapAreaColor)
    }

    getFlyClick() {
        this.gameContainer.getFlyClick()
    }

    showRedScreen() {
        if (playerSaves < 0) return

        this.tapAreaColor = 0xff0000
        this.tapArea.alpha = 0.0003
        this.redIsUp = true
        this.redrawTapArea()

        tickerAdd(this)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
    }

    tick(deltaMs) { console.log(this.redIsUp)
        if (this.redIsUp) {
            this.tapArea.alpha = Math.min(0.6, this.tapArea.alpha + this.redSpeed * deltaMs)
            if (this.tapArea.alpha === 0.6) this.redIsUp = false
        } else {
            this.tapArea.alpha = Math.max(0.0003, this.tapArea.alpha - this.redSpeed * deltaMs)
            if (this.tapArea.alpha === 0.0003) {
                this.redIsUp = false
                this.tapAreaColor = 0x000000
                tickerRemove(this)
            }
        }
    }

    kill() {
        tickerRemove(this)
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
        EventHub.off( events.resetCombo, this.redHighlight, this )
        this.tapArea.off('pointerdown', this.getFlyClick, this)
    }
}