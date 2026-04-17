import { Container, Sprite, Text } from 'pixi.js'
import { kill, tickerAdd, tickerRemove } from '../../../app/application'
import { atlases, images } from '../../../app/assets'
import BackgroundImage from '../../BG/BackgroundImage'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import { SCENE_NAME } from '../SceneManager'
import { BUTTON_TYPE, TEXT_LOAD_TOP } from '../../localText'
import { EventHub, events, getTopResults } from '../../../app/events'
import { getLanguage } from '../../localization'
import { styles } from '../../../app/styles'
import TopTable from './TopTable'

const OFFSET_Y = 120
const OFFSET_X = 30

const TABLE_WIDTH = 680
const TABLE_HEIGHT = 680

// Цвета для анимации спиннера
const COLOR_BLUE = 0x3366ff;
const COLOR_FUCHSIA = 0xff00ff;

export default class ResultsScene extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.spinner = new Sprite( images.load_spinner )
        this.spinner.blendMode = 'screen'
        this.spinnerSpeed = 0.0018
        this.spinner.tint = COLOR_BLUE  // начальный цвет
        this.spinner.anchor.set(0.5)
        this.spinner.position.set(0, -20)
        this.mainContainer.addChild(this.spinner)

        this.loadText = new Text({
            text: TEXT_LOAD_TOP[this.currentLanguage], style: styles.popupDescription
        })
        this.loadTextDots = 0
        this.loadTextTime = 0
        this.loadText.anchor.set(0.5)
        this.loadText.position.set(0, 160)
        this.mainContainer.addChild(this.loadText)

        this.table = null

        this.ui = new MenuUI(this, SCENE_NAME.Menu, BUTTON_TYPE.BACK)
        this.addChild(this.ui)

        this.popup = new Popup()
        this.addChild(this.popup)

        EventHub.on( events.getTopResults, this.getTopResults, this )

        // Переменная для анимации цвета
        this.tintTime = 0;

        tickerAdd(this)
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)
        this.ui.screenResize(screenData)
        this.popup.screenResize(screenData)

        const width = screenData.width - OFFSET_X * 2
        const height = screenData.height - OFFSET_Y * (screenData.isLandscape ? 2 : 3)

        const scaleX = Math.min(1, width / TABLE_WIDTH)
        const scaleY = Math.min(1, height / TABLE_HEIGHT)
        const scale = Math.min(scaleX, scaleY)
        console.log(scale)
        this.mainContainer.scale.set(Math.min(scaleX, scaleY))
        this.mainContainer.position.set(0, screenData.isLandscape ? -36 : 0)
    }

    getTopResults(data) {
        tickerRemove(this)

        this.mainContainer.removeChild(this.spinner)
        this.spinner.destroy()
        this.spinner = null

        this.mainContainer.removeChild(this.loadText)
        this.loadText.destroy()
        this.loadText = null

        this.table = new TopTable(data, TABLE_WIDTH, TABLE_HEIGHT)
        this.mainContainer.addChild(this.table)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
        if (this.loadText) {
            this.loadText.text = TEXT_LOAD_TOP[this.currentLanguage]
            this.loadTextDots = 0
            this.loadTextTime = 0
        }
    }

    tick(deltaMs) {
        if (this.spinner) {
            // Вращение спиннера
            this.spinner.rotation += this.spinnerSpeed * deltaMs;

            // Анимация цвета: плавное перетекание от синего к фуксии и обратно
            this.tintTime += deltaMs * 0.002; // скорость изменения цвета
            // t пульсирует от 0 до 1 и обратно с помощью синуса
            const t = (Math.sin(this.tintTime) + 1) * 0.5;

            // Интерполяция компонентов RGB
            const r1 = (COLOR_BLUE >> 16) & 0xff;
            const g1 = (COLOR_BLUE >> 8) & 0xff;
            const b1 = COLOR_BLUE & 0xff;
            
            const r2 = (COLOR_FUCHSIA >> 16) & 0xff;
            const g2 = (COLOR_FUCHSIA >> 8) & 0xff;
            const b2 = COLOR_FUCHSIA & 0xff;

            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);

            this.spinner.tint = (r << 16) | (g << 8) | b;

            // dots
            this.loadTextTime += deltaMs
            if (this.loadTextTime > 900) {
                this.loadTextTime -= 900
                this.loadTextDots = (this.loadTextDots + 1) % 4 // 0,1,2,3
                const dits = '.'.repeat(this.loadTextDots)
                this.loadText.text = TEXT_LOAD_TOP[this.currentLanguage] + dits
            }
        } else {
            tickerRemove(this)
        }
    }

    kill() {
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
        EventHub.off( events.getTopResults, this.getTopResults, this )
    }
}