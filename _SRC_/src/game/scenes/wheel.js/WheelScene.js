import { Container, Sprite, Text, Texture } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import { nextAvatar, playerAvatarIndex, playerAvatarKeys, playerCoins, resetScoreToPrevious } from '../../state'
import { AVATARS } from '../level/Player'
import { styles } from '../../../app/styles'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import { SCENE_NAME } from '../SceneManager'

const OFFSET_Y = 120
const OFFSET_X = 30

const SIZE = 620

export default class WheelScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.wheelDisc = new Sprite(images.wheel_disc)
        this.wheelDisc.anchor.set(0.5)
        this.wheelDisc.rotation = Math.random() * (Math.PI * 2)
        this.mainContainer.addChild(this.wheelDisc)

        this.wheelBorder = new Sprite(images.wheel_border)
        this.wheelBorder.anchor.set(0.5)
        this.mainContainer.addChild(this.wheelBorder)

        this.ui = new MenuUI(this, SCENE_NAME.Menu)
        this.addChild(this.ui)

        this.popup = new Popup()
        this.addChild(this.popup)
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)
        this.ui.screenResize(screenData)
        this.popup.screenResize(screenData)

        const widthRate = screenData.width / screenData.height

        const width = screenData.width - OFFSET_X * 2
        const height = screenData.height - (widthRate > 2 ? OFFSET_Y * 1.5 : OFFSET_Y * 2)

        const scaleX = Math.min(1, width / SIZE)
        const scaleY = Math.min(1, height / SIZE)
        this.mainContainer.scale.set(Math.min(scaleX, scaleY))
        this.mainContainer.position.set(0, widthRate > 1 ? -36 : 0)
    }

    tryToBuy() {

    }
}