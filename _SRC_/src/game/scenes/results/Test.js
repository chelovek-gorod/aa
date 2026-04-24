import { Container, Graphics, Text } from "pixi.js"
import ScrollContainer from "../../UI/ScrollContainer"

export default class Test extends Container {
    constructor(data, height) {
        super()

        this.tableHeight = height

        this.listContainer = new Container()

        // ВАЖНО: контент начинается с (0,0)
        for (let i = 0; i < 21; i++) {
            const g = new Graphics()

            // правильная модель:
            g.rect(0, 0, 200, 60)
            g.fill(i % 2 === 0 ? 0x00ff00 : 0xff00ff)

            // позиционируем контейнер, а не геометрию
            g.y = i * 64

            this.listContainer.addChild(g)
        }

        // ScrollContainer
        this.scroll = new ScrollContainer(
            this.listContainer,
            220,
            160
        )

        this.addChild(this.scroll)
    }

    clearTable() {
        this.listContainer.removeChildren().forEach(c => c.destroy())
    }

    kill() {
        if (this.scroll) {
            this.scroll.destroy({ children: true })
            this.scroll = null
        }
        this.clearTable()
        this.destroy({ children: true })
    }
}