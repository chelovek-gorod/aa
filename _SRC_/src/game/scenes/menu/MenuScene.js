import { Container, Sprite } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images, music } from '../../../app/assets'
import { startScene } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { SCENE_NAME } from '../SceneManager'
import BackgroundImage from '../../BG/BackgroundImage'
import Button from '../../UI/Button'
import { playerAddSave, resetScoreToPrevious } from '../../state'
//import { TEXT_BUTTON_TYPE } from '../../localText'
//import Title from './Title'

export default class Menu extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        resetScoreToPrevious()

        this.bg = new BackgroundImage( images.bg_main )
        this.addChild(this.bg)

        this.logo = new Sprite(images.logo)
        this.logo.scale.set(0.75)
        this.logo.anchor.set(1)
        this.addChild(this.logo)

        this.logo.eventMode = 'static'
        this.logo.on('pointerdown', this.addSave, this)
        
        /*
        this.title = new Title()
        this.titleStartWidth = this.title.width
        this.titleStartHeight = this.title.height
        this.addChild(this.title)
        */

        this.startButton = new Button(
            null, 'START' /* TEXT_BUTTON_TYPE.START*/, () => {
                if (!this.isMenuActive) return

                this.isMenuActive = false
                startScene(SCENE_NAME.Level)
            }, true
        )
        // this.startButton.scale.set(0.75)
        this.addChild(this.startButton)

        setMusicList([music.bgm_0, music.bgm_1, music.bgm_2, music.bgm_3, music.bgm_4])
    }

    addSave() {
        playerAddSave(1)
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)

        this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)

        /*
        const titleScaleX = Math.min(1, screenData.width / (this.titleStartWidth + 120))
        const titleScaleY = Math.min(1, screenData.centerY / (this.titleStartHeight + 60))
        const pointY = screenData.centerY * 0.3
        this.title.scale.set( Math.min(titleScaleX, titleScaleY) )
        this.title.position.set(0, -pointY)
        */

        this.startButton.position.set(0, screenData.centerY * 0.5)
    }

    kill() {
        this.logo.off('touchstart', this.addSave, this)
    }
}