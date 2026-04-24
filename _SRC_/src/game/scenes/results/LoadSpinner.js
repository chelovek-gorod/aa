import { Container, Sprite, Text } from 'pixi.js'
import { tickerAdd } from '../../../app/application'
import { atlases } from '../../../app/assets'
import { EventHub, events } from '../../../app/events'
import { getLanguage } from '../../localization'
import { styles } from '../../../app/styles'
import { TEXT_LOAD_TOP } from '../../localText'

const COLOR_BLUE = 0x3366ff;
const COLOR_FUCHSIA = 0xff00ff;

export default class LoadSpinner extends Container {
    constructor() {
        super()

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.tintTime = 0

        this.spinner = new Sprite( atlases.ui.textures.load_spinner )
        this.spinner.blendMode = 'screen'
        this.spinnerSpeed = 0.006
        this.spinner.tint = COLOR_BLUE  // начальный цвет
        this.spinner.anchor.set(0.5)
        this.spinner.position.set(0, -20)
        this.addChild(this.spinner)

        this.loadText = new Text({
            text: TEXT_LOAD_TOP[this.currentLanguage], style: styles.popupDescription
        })
        this.loadTextDots = 0
        this.loadTextTime = 0
        this.loadText.anchor.set(0.5)
        this.loadText.position.set(0, 160)
        this.addChild(this.loadText)

        tickerAdd(this)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
        this.loadText.text = TEXT_LOAD_TOP[this.currentLanguage]
        this.loadTextDots = 0
        this.loadTextTime = 0
    }

    tick(deltaMs) {
        // Вращение спиннера
        this.spinner.rotation += this.spinnerSpeed * deltaMs;

        // Анимация цвета: плавное перетекание от синего к фуксии и обратно
        this.tintTime += deltaMs * 0.012; // скорость изменения цвета
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
    }

    kill() {
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
    }
}