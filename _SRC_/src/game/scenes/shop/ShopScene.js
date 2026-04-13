import { Container, Sprite, Text, Texture } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import { nextAvatar, playerAvatarIndex, playerAvatarKeys, playerCoins, resetScoreToPrevious } from '../../state'
import { AVATARS } from '../level/Player'
import { styles } from '../../../app/styles'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import SkinItem from './SkinItem'
import { SCENE_NAME } from '../SceneManager'

const OFFSET_Y = 120
const OFFSET_X = 10

const STEP = 250

export default class ShopMenu extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        resetScoreToPrevious()

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.popup = new Popup()

        this.ui = new MenuUI(this, SCENE_NAME.Menu)
        this.addChild(this.ui)

        for(let i = 12; i > 0; i--) {
            const y = (i > 8) ? STEP : (i > 4) ? 0 : -STEP
            const x = ((i - 1) % 4) * STEP - STEP * 2
            const skin = new SkinItem(i, this.tryToBuy.bind(this))
            skin.position.set(x + STEP * 0.5, y)
            this.mainContainer.addChild(skin)
        }

        this.mainContainerWidth = 1000 // this.mainContainer.width
        this.mainContainerHeight = 750 // this.mainContainer.height

        this.addChild(this.popup)
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)
        this.ui.screenResize(screenData)
        this.popup.screenResize(screenData)

        if (screenData.isLandscape) {
            const maxScale = 0.75
            const width = screenData.width - OFFSET_X * 2
            const height = screenData.height - OFFSET_Y * 2
            const scaleX = Math.min(maxScale, width / this.mainContainerWidth)
            const scaleY = Math.min(maxScale, height / this.mainContainerHeight)
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, 0)
        } else {
            const maxScale = 0.5
            const width = screenData.width - OFFSET_X * 2
            const height = screenData.height - OFFSET_Y * 2
            const scaleX = Math.min(maxScale, width / this.mainContainerWidth)
            const scaleY = Math.min(maxScale, height / this.mainContainerHeight)
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, 20)
        }
    }

    tryToBuy() {

    }
}