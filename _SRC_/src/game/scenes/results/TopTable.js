import { Assets, Container, Graphics, Sprite, Text } from "pixi.js"
import { atlases } from "../../../app/assets"
import { EventHub, events } from "../../../app/events"
import { styles } from "../../../app/styles"
import { getLanguage } from "../../localization"
import { TEXT_EMPTY_TOP_LIST } from "../../localText"
import ScrollContainer from "../../UI/ScrollContainer"
import { formatNumber } from "../level/UI"
import { TABLE_HEIGHT, TABLE_WIDTH } from "./ResultsScene"

const LINE_H = 64
const LOGIN_OFFSET = 64

export default class TopTable extends Container {
    constructor(data) {
        super()

        this.isAuthorized = data.isAuthorized
        this.userRank = data.userRank
        this.aroundEntries = data.aroundEntries || []
        this.topEntries = data.topEntries || []

        this.emptyText = null

        this.listContainer = new Container()
        this.fillTable()

        this.scroller = new ScrollContainer(this.listContainer, TABLE_HEIGHT)
        this.scroller.position.set(-TABLE_WIDTH * 0.5, -TABLE_HEIGHT * 0.5)
        this.addChild(this.scroller)

        EventHub.on( events.updateLanguage, this.getLanguage, this )
    }

    clearTable() {
        if (this.listContainer) {
            this.listContainer.removeChildren().forEach(child => {
                if (child instanceof Sprite && child.texture && child._isLoadedTexture) {
                    child.texture.destroy(true)
                }
                child.destroy({ children: true })
            })
        }
        if (this.emptyText) {
            this.removeChild(this.emptyText)
            this.emptyText = null
        }
    }

    fillTable() {
        const allRows = this.buildFullRowList()

        if (allRows.length === 0) {
            this.emptyText = new Text({ text: TEXT_EMPTY_TOP_LIST[getLanguage()], style: styles.topTableCenter })
            this.emptyText.anchor.set(0.5)
            this.emptyText.position.set(TABLE_WIDTH * 0.5, 128)
            this.addChild(this.emptyText)
        } else {
            const lastRowIndex = allRows.length - 1
            allRows.forEach((rowData, i) => {
                if (rowData === null) this.addSeparator(i)
                else this.addLine(rowData, i, i === lastRowIndex)
            })
        }
    }

    buildFullRowList() {
        if (!this.isAuthorized) return this.topEntries
 
        if (this.topEntries.length === 0 && this.aroundEntries.length === 0) return []

        const uniqueMap = new Map()
        for (const entry of this.topEntries) uniqueMap.set(entry.rank, entry)
        for (const entry of this.aroundEntries) {
            if (!uniqueMap.has(entry.rank)) uniqueMap.set(entry.rank, entry)
        }
    
        const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.rank - b.rank)
    
        const result = []
        let prevRank = null
        for (const entry of sorted) {
            if (prevRank !== null && entry.rank !== prevRank + 1) {
                result.push(null)   // разделитель "..."
            }
            result.push(entry)
            prevRank = entry.rank
        }
        return result
    }

    addSeparator(index) {
        const y = LINE_H * (index + 0.5)
        const dots = new Text({ text: "...", style: styles.topTableCenter })
        dots.anchor.set(0.5)
        dots.position.set(0, y)
        this.listContainer.addChild(dots)

        const line = new Sprite(atlases.ui.textures.medal_line)
        line.anchor.set(0.5)
        line.position.set(TABLE_WIDTH * 0.5, y + LINE_H * 0.5)
        this.listContainer.addChild(line)
    }

    addLine(data, globalIndex, isLast) {
        const y = LINE_H * (globalIndex + 0.5)

        if (data.isCurrentUser) {
            const bg = new Graphics()
            bg.roundRect(9, y - LINE_H * 0.5 + 9, TABLE_WIDTH - 18, LINE_H - 18, 18)
            bg.fill(0x77ff77)
            bg.alpha = 0.36
            this.listContainer.addChild(bg)
        }

        if (data.rank < 4) {
            const icon = new Sprite(atlases.ui.textures['medal_' + data.rank])
            icon.anchor.set(0.5)
            icon.scale.set(0.5)
            icon.position.set(90, y)
            this.listContainer.addChild(icon)
        } else {
            const rank = new Text({ text: data.rank.toLocaleString('ru-RU'), style: styles.topTableCenter })
            rank.anchor.set(0.5)
            rank.position.set(90, y)
            this.listContainer.addChild(rank)
        }

        const playerAvatar = new Sprite(atlases.ui.textures.player_avatar)
        playerAvatar.anchor.set(0.5)
        playerAvatar.position.set(200, y)
        playerAvatar.width = 48
        playerAvatar.height = 48
        this.listContainer.addChild(playerAvatar)

        const avatarMask = new Sprite(atlases.ui.textures.player_avatar_mask)
        avatarMask.anchor.set(0.5)
        avatarMask.position.set(200, y)
        avatarMask.width = 48
        avatarMask.height = 48
        this.listContainer.addChild(avatarMask)
        playerAvatar.mask = avatarMask

        if (data.avatarSrc) {
            console.log('data.avatarSrc', data.avatarSrc)
            Assets.load({
                src: data.avatarSrc,
                loadParser: 'loadTextures',
                data: { crossOrigin: 'anonymous' }
            }).then((avatarTexture) => {
                playerAvatar.texture = avatarTexture
                playerAvatar._isLoadedTexture = true
                playerAvatar.width = 48
                playerAvatar.height = 48
            }).catch(err => console.warn("Avatar load error", err))
        }

        const displayName = data.playerName.length > 20 
            ? data.playerName.slice(0, 20) + '...' 
            : data.playerName
        const playerName = new Text({ text: displayName, style: styles.topTableLeft })
        playerName.anchor.set(0.5)
        playerName.position.set(290, y)
        this.listContainer.addChild(playerName)

        const playerScore = new Text({ text: formatNumber(data.score, true), style: styles.topTableRight })
        playerScore.anchor.set(1, 0.5)
        playerScore.position.set(620, y)
        this.listContainer.addChild(playerScore)

        const line = new Sprite(atlases.ui.textures.medal_line)
        line.anchor.set(0.5)
        line.scale.set(1, 0.25)
        line.alpha = isLast ? 0 : 1
        line.position.set(TABLE_WIDTH * 0.5, y + LINE_H * 0.5)
        this.listContainer.addChild(line)
    }

    getLanguage(lang) {
        if (this.emptyText) this.emptyText.text = TEXT_EMPTY_TOP_LIST[lang]
    }

    kill() {
        EventHub.off( events.updateLanguage, this.getLanguage, this )
        this.clearTable()
    }
}