import { Sprite, Text } from "pixi.js";
import { kill, tickerAdd } from "../../../app/application";
import { images } from "../../../app/assets";
import { styles } from "../../../app/styles";

export default class FlyText extends Text {
    constructor(text, x, y) {
        super({text: text ? text : 'Новый уровень!', style: text ? styles.flyText : styles.flyTextLevel}) 
        this.anchor.set(0.5)

        this.position.set(x,y)

        this.lifeTime = text ? 300 : 900
        this.alphaStep = text ? 0.0012 : 0.0003
        this.flySpeed = text ? 0.24 : 0.18

        tickerAdd(this)
    }

    tick(deltaMs) {
        this.y -= this.flySpeed * deltaMs

        if (this.lifeTime > 0) {
            this.lifeTime -= deltaMs
        } else {
            this.alpha -= this.alphaStep * deltaMs
            if (this.alpha <= 0) kill(this)
        }
    }
}