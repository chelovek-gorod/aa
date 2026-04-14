import { Container, Text, Sprite, Graphics } from 'pixi.js'
import { assetType, assets, sounds } from '../../../app/assets'
import { styles } from '../../../app/styles'
import { getAppScreen, tickerAdd, tickerRemove } from '../../../app/application'
import { loadAssets, preloadAsset, preloadFonts } from './Loader'
import BackgroundGradient from '../../BG/BackgroundGradient'
import { removeCursorPointer, setCursorPointer } from '../../../utils/functions'
import { EventHub, startScene, events } from '../../../app/events'
import { SCENE_NAME } from '../SceneManager'
import { getFirstUserAction, soundPlay } from '../../../app/sound'
import { getLanguage } from '../../localization'
import { TEXT_GET_FIRST_CLICK } from '../../localText'

const ALPHA_STEP = 0.003

const PROGRESS_BAR = {
    x: -135,
    offsetY: 64,
    width: 270,
    height: 36,
    borderLineWidth: 6,
    progressOffset: 10,
    color: 0xffffff,
    borderRadius: 18,
    progressRadius: 8,
}

const PROGRESS_TEXT = {
    offsetY: PROGRESS_BAR.offsetY + PROGRESS_BAR.height + PROGRESS_BAR.borderLineWidth * 2 - 16,
}

const TITLE_W = 760
const TITLE_H = 480

let isFirstLoading = true

export default class LoadScene extends Container {
    constructor() {
        super()

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.bg = null
        this.logo = null
        this.title = null

        this.progressRange = 0
        this.progressBar = new Graphics()
        this.drawProgress(this.progressRange)
        this.addChild(this.progressBar)

        this.progressText = null
        this.doneText = null

        this.isLoadingDone = false

        if (isFirstLoading) preloadFonts(this.setText.bind(this))
        else this.setText()
    }

    setText() {
        if (!this.progressText) {
            this.progressText = new Text({ text:'0%', style: styles.loading })
            this.progressText.anchor.set(0.5)
            this.progressText.position.y = this.screenFreeSide - PROGRESS_TEXT.offsetY
            this.addChild(this.progressText)
        }

        this.preloadBg()
    }

    preloadBg() {
        if (!this.bg) {
            preloadAsset(assetType.images, 'bg_main', this.setBg.bind(this))
        }

        tickerAdd(this)
    }

    setBg() {
        this.bg = new Sprite(assets.images.bg_main)
        this.bg.tint = 0x999999
        this.bg.alpha = 0
        this.bg.anchor.set(0.5)
        this.bg.position.set(0, 0)
        this.bg.scale.set( Math.max(this.screenData.width / 1920, this.screenData.height / 1920) )
        this.addChildAt(this.bg, 0)

        this.preloadLogo()
    }

    preloadLogo() {
        if (!this.logo) {
            preloadAsset(assetType.images, 'logo', this.setLogo.bind(this))
        }
    }

    setLogo() {
        this.logo = new Sprite(assets.images.logo)
        this.logo.scale.set(0.5)
        this.logo.alpha = 0
        this.logo.anchor.set(1)
        this.logo.position.set(this.screenData.centerX - 12, this.screenData.centerY - 12)
        this.addChild(this.logo)

        this.preloadTitle()
    }

    preloadTitle() {
        if (!this.title) {
            preloadAsset(assetType.images, 'title', this.setTitle.bind(this))
        }
    }

    setTitle() {
        this.title = new Sprite(assets.images.title)
        this.title.anchor.set(0.5)
        this.title.alpha = 0
        this.title.scale.set( Math.min(1, this.screenFreeSide / (TITLE_W * 0.5)) )
        this.title.position.set(0, 0)
        this.addChildAt(this.title, 1)

        this.startLoading()
    }

    startLoading() {
        const loadingData = {
            [assetType.images]: Object.keys(assets.images),
            [assetType.atlases]: Object.keys(assets.atlases),
            [assetType.sounds]: Object.keys(assets.sounds)
        }
        
        loadAssets(loadingData, this.loadingDone.bind(this), this.update.bind(this))
    }

    loadingDone() {
        this.doneText = new Text({
            text: TEXT_GET_FIRST_CLICK[ this.currentLanguage ],
            style: styles.loading
        })
        this.doneText.alpha = 0
        this.doneText.anchor.set(0.5)
        this.doneText.position.set(0, this.screenFreeSide - PROGRESS_TEXT.offsetY)
        const screenData = getAppScreen()
        this.resizeDoneText( screenData.width )
        this.addChild(this.doneText)

        this.isLoadingDone = true

        setCursorPointer(this)
        this.on('pointerdown', this.getClick, this)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
        if (this.doneText) this.doneText.text = TEXT_GET_FIRST_CLICK[ this.currentLanguage ]
        const screenData = getAppScreen()
        this.resizeDoneText( screenData.width )
    }

    resizeDoneText(screenWidth) {
        this.doneText.scale.set(1)
        const scale = Math.min(1, screenWidth / (this.doneText.width + 24))
        this.doneText.scale.set(scale)
        this.doneText.position.set(0, this.screenFreeSide - PROGRESS_TEXT.offsetY)
    }

    screenResize(screenData) {
        this.screenData = screenData
        this.screenFreeSide = this.screenData.isLandscape
            ? this.screenData.centerY
            : this.screenData.centerX

        this.position.set(this.screenData.centerX, this.screenData.centerY)
        if (this.progressText) this.progressText.position.y = this.screenFreeSide - PROGRESS_TEXT.offsetY
        if (this.bg) this.bg.scale.set( Math.max(screenData.width / 1920, screenData.height / 1920) )
        if (this.logo) this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)
        if (this.title) this.title.scale.set( Math.min(1, this.screenFreeSide / (TITLE_W * 0.5)) )
        if (this.doneText) this.resizeDoneText(screenData.width)

        this.drawProgress(this.progressRange)
    }

    update(progress, loadedAssetsCount, assetsCount) {
        const range = Math.round(progress)
        this.drawProgress(range)
        this.progressText.text = range + '%'
    }

    drawProgress(range) {
        this.progressRange = range
        this.progressBar.clear()

        const progressBarY = this.screenFreeSide - PROGRESS_BAR.offsetY
        this.progressBar.roundRect(
            PROGRESS_BAR.x, progressBarY,
            PROGRESS_BAR.width, PROGRESS_BAR.height,
            PROGRESS_BAR.borderRadius
        )
        this.progressBar.stroke({width: PROGRESS_BAR.borderLineWidth, color: PROGRESS_BAR.color})

        const width = 2.5 * range
        if (width < PROGRESS_BAR.progressRadius) return
        
        this.progressBar.roundRect(
            PROGRESS_BAR.x + PROGRESS_BAR.progressOffset,
            progressBarY + PROGRESS_BAR.progressOffset,
            width,
            PROGRESS_BAR.height - PROGRESS_BAR.progressOffset * 2,
            PROGRESS_BAR.progressRadius
        )
        this.progressBar.fill(PROGRESS_BAR.color)
    }

    getClick() {
        if (!this.isLoadingDone) return

        getFirstUserAction()
        soundPlay(sounds.se_click)

        startScene(SCENE_NAME.Menu)
    }

    tick(delta) {
        const alphaStep = delta * ALPHA_STEP
        if (this.bg && this.bg.alpha < 1) this.bg.alpha += alphaStep
        if (this.logo && this.logo.alpha < 1) this.logo.alpha += alphaStep
        if (this.title && this.title.alpha < 1) this.title.alpha += alphaStep
        
        if (this.isLoadingDone) {
            this.progressBar.alpha -= alphaStep
            this.progressText.alpha -= alphaStep
            this.doneText.alpha += alphaStep
            if (this.doneText.alpha >= 1) tickerRemove(this)
        } 
    }

    kill() {
        removeCursorPointer(this)
        this.off('pointerdown', this.getClick, this)
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
    }
}