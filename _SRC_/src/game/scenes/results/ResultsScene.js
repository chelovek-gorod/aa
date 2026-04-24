import { Container, Graphics } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import { SCENE_NAME } from '../SceneManager'
import { BUTTON_TYPE } from '../../localText'
import { EventHub, events } from '../../../app/events'
import TopTable from './TopTable'
import LoadSpinner from './LoadSpinner'
import { getTopPlayers } from '../../storage'

const OFFSET_Y = 120
const OFFSET_X = 30

export const TABLE_WIDTH = 660
export const TABLE_HEIGHT = 440

export default class ResultsScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.spinner = new LoadSpinner()
        this.mainContainer.addChild(this.spinner)

        this.table = null
        this.tableHeight = 0

        //this.test = new Graphics()
        //this.addChild(this.test)

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

        const width = screenData.width - OFFSET_X * 2
        const height = screenData.height - OFFSET_Y * (screenData.isLandscape ? 2 : 2.7)

        const scaleX = Math.min(1, width / TABLE_WIDTH)
        const scaleY = Math.min(1, height / TABLE_HEIGHT)
        const scale = Math.min(scaleX, scaleY)

        this.tableHeight = Math.min(440, Math.floor(height / scale))
        if (this.table) this.table.setHeight(this.tableHeight)

        this.mainContainer.scale.set(scale)
        this.mainContainer.position.set(0, screenData.isLandscape ? -40 : 10)

        // this.updateTest(width, height, scale, screenData.isLandscape)
    }

    updateTest(freeWidth, freeHeight, scale, isH) {
        this.test.clear()
        this.test.roundRect(
            -freeWidth * 0.5,
            isH ? -freeHeight * 0.5 - 30 : -freeHeight * 0.5 + 10,
            freeWidth,
            freeHeight,
            18
        )
        this.test.fill(0x00ff00)
    }

    getTopResults(data) {
        this.mainContainer.removeChild(this.spinner)
        kill(this.spinner)
        this.spinner = null

        this.table = new TopTable(data, this.tableHeight, this.updateTableData.bind(this))
        this.mainContainer.addChild(this.table)
    }

    updateTableData() {
        this.mainContainer.removeChild(this.table)
        kill(this.table)
        this.table = null
        
        this.spinner = new LoadSpinner()
        this.mainContainer.addChild(this.spinner)

        getTopPlayers()
    }

    kill() {
        EventHub.off( events.getTopResults, this.getTopResults, this )

        if (this.table) this.table.clearTable()
    }
}