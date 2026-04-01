import { Container, Graphics, Sprite } from 'pixi.js'
import { images, music } from '../../../app/assets'
import { EventHub, events } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { getLanguage } from '../../localization'
import Shaker from './Shaker'
import GameContainer from './GameContainer'
import UI from './UI'
import { kill, tickerAdd, tickerRemove } from '../../../app/application'
import { playerLevel, playerSaves, playerScore } from '../../state'
import { HELP_DURATION, HELP_IN_OUT } from './constants'

const musics = [ 
    music.bgm_1, music.bgm_2, music.bgm_3, music.bgm_4,
    music.bgm_5, music.bgm_6, music.bgm_7
]
let currentMusicIndex = Math.floor( Math.random() * musics.length )
function getMusic() {
    const music = musics[currentMusicIndex]
    currentMusicIndex++
    if (currentMusicIndex === musics.length) currentMusicIndex = 0
    return music
}

export default class LevelScene extends Container {
    constructor() {
        super()

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.shaker = new Shaker()
        this.addChild(this.shaker)

        this.gameContainer = new GameContainer(this.shaker)
        this.shaker.addChild(this.gameContainer)

        if (playerLevel === 1) {
            this.help = new Sprite(images.help)
            this.help.anchor.set(0.5)
            this.help.alpha = 0
            this.help.time = HELP_DURATION + HELP_IN_OUT
            this.help.alphaStep = 1 / HELP_IN_OUT
            this.addChild(this.help)

            tickerAdd(this)
        }

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

        EventHub.on( events.removePlyerSave, this.showRedScreen, this )
        
        setMusicList( getMusic() )
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

        if(this.help) {
            const helpScale = Math.min(
                1,
                screenData.width / this.help.texture.width,
                screenData.height / this.help.texture.height
            )
            this.help.scale.set( helpScale )
        }
        
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
        this.tapAreaColor = 0xff0000
        this.tapArea.alpha = 0.0003
        this.redIsUp = true
        this.redrawTapArea()

        tickerAdd(this)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
    }

    tick(deltaMs) {
        if(this.help) {
            if (this.help.time > HELP_DURATION) {
                this.help.alpha = Math.min(1, this.help.alpha + this.help.alphaStep * deltaMs)
                if (this.help.alpha === 1) this.help.time = HELP_DURATION
            } else {
                if (this.help.alpha === 1) {
                    this.help.time -= deltaMs
                    if (this.help.time <= 0) {
                        this.help.alpha -= this.help.alphaStep
                        this.help.time = HELP_IN_OUT
                    }
                } else {
                    this.help.alpha = Math.max(0, this.help.alpha - this.help.alphaStep * deltaMs)
                    if (this.help.alpha === 0) {
                        this.help.destroy()
                        this.help = null
                        tickerRemove(this)
                    }
                }
            }
            return
        }

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
        EventHub.off( events.removePlyerSave, this.showRedScreen, this )
        this.tapArea.off('pointerdown', this.getFlyClick, this)
    }
}