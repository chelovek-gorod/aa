import { Container } from 'pixi.js'
import { kill, tickerAdd } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import { SCENE_NAME } from '../SceneManager'
import { BUTTON_TYPE } from '../../localText'
import { EventHub, events, getTopResults } from '../../../app/events'

const OFFSET_Y = 120
const OFFSET_X = 30
const SIZE = 720

export default class ResultsScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.ui = new MenuUI(this, SCENE_NAME.Menu, BUTTON_TYPE.BACK)
        this.addChild(this.ui)

        this.popup = new Popup()
        this.addChild(this.popup)

        EventHub.on( events.getTopResults, this.getTopResults, this )
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

    getTopResults(data) {
        console.log(data)
    }

    kill() {
        EventHub.off( events.getTopResults, this.getTopResults, this )
    }
}