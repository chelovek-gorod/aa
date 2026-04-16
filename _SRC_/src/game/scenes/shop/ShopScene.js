import { Container } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import SkinItem from './SkinItem'
import { SCENE_NAME } from '../SceneManager'
import { BUTTON_TYPE, FLY_MESSAGE_TYPE, TEXT_FLY_MESSAGE } from '../../localText'
import FlyText from '../level/FlyText'
import { getLanguage } from '../../localization'

const OFFSET_Y = 120
const OFFSET_X = 30

const STEP = 250

export default class ShopScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.popup = new Popup()

        this.ui = new MenuUI(this, SCENE_NAME.Menu, BUTTON_TYPE.BACK)
        this.addChild(this.ui)

        for(let i = 1; i < 13; i++) {
            const skin = new SkinItem(i, this.lowCoins.bind(this), this.updateCoins.bind(this))
            this.mainContainer.addChild(skin)
        }

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

        if (widthRate > 2) {
            // 6 + 6
            const startX = -2.5 * STEP
            for(let i = this.mainContainer.children.length - 1; i >= 0; i--) {
                const skin = this.mainContainer.children[i]
                const index = i % 6
                const x = startX + index * STEP
                const y = i > 5 ? STEP * 0.5 : -STEP * 0.5
                skin.position.set(x, y)
            }

            const scaleX = Math.min(1, width / (STEP * 6))
            const scaleY = Math.min(1, height / (STEP * 2))
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, -30)
        } else if (widthRate > 0.6) {
            // 4 + 4 + 4
            const startX = -1.5 * STEP
            for(let i = this.mainContainer.children.length - 1; i >= 0; i--) {
                const skin = this.mainContainer.children[i]
                const index = i % 4
                const x = startX + index * STEP
                const y = i > 7 ? STEP: i > 3 ? 0 : -STEP
                skin.position.set(x, y)
            }

            const minScale = widthRate > 1 ? 1 : 0.75
            const scaleX = Math.min(minScale, width / (STEP * 4))
            const scaleY = Math.min(minScale, height / (STEP * 3))
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, widthRate > 1 ? -30 : 10)
        } else {
            // 3 + 3 + 3 + 3
            const startX = -STEP
            for(let i = this.mainContainer.children.length - 1; i >= 0; i--) {
                const skin = this.mainContainer.children[i]
                const index = i % 3
                const x = startX + index * STEP
                const y = i > 8 ? STEP * 1.5 : i > 5 ? STEP * 0.5 : i > 2 ? -STEP * 0.5 : -STEP * 1.5
                skin.position.set(x, y)
            }

            const scaleX = Math.min(1.2, width / (STEP * 3))
            const scaleY = Math.min(1.2, height / (STEP * 4))
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, 0)
        }
    }

    updateCoins() {
        this.ui.updateCoins()
    }

    lowCoins() {
        const message = TEXT_FLY_MESSAGE[FLY_MESSAGE_TYPE.LOW_COINS][getLanguage()]
        this.addChild(new FlyText(message, 0, 0, false))
    }
}