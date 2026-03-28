import { Container, Graphics } from 'pixi.js'
import { music } from '../../../app/assets'
import { EventHub, events } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { getLanguage } from '../../localization'
import Shaker from './Shaker'
import GameContainer from './GameContainer'
import UI from './UI'

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

        this.UI = new UI(this.gameContainer)
        this.addChild(this.UI)
        
        setMusicList([ music.bgm_0, music.bgm_1, music.bgm_2, music.bgm_3, music.bgm_4 ])
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.UI.screenResize(screenData)

        this.tapArea.clear()
        this.tapArea.rect(
            -screenData.centerX, -screenData.centerY,
            screenData.width, screenData.height
        )
        this.tapArea.fill(0x000000)

        this.shaker.screenResize(screenData)
    }

    getFlyClick() {
        this.gameContainer.getFlyClick()
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
    }

    kill() {
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
        EventHub.off( events.addScore, this.addScore, this )
        EventHub.off( events.resetCombo, this.resetCombo, this )
        
        this.tapArea.on('pointerdown', this.getFlyClick, this)
    }
}