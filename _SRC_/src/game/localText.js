import { getDeviceType } from "../app/application"
import { createEnum } from "../utils/functions"

const isMobile = getDeviceType() !== 'desktop'

export const TEXT_GET_FIRST_CLICK = {
    en: isMobile ? 'Tap to start' : 'Click to start',
    ru: 'Нажми, чтобы начать',
    tr: isMobile ? 'Başlamak için dokun' : 'Başlamak için tıkla',
    es: isMobile ? 'Toca para empezar' : 'Haz clic para empezar',
    de: isMobile ? 'Zum Starten tippen' : 'Zum Starten klicken',
    pt: isMobile ? 'Toque para começar' : 'Clique para começar',
    fr: isMobile ? 'Appuyez pour commencer' : 'Cliquez pour commencer',
    pl: isMobile ? 'Dotknij, aby rozpocząć' : 'Kliknij, aby rozpocząć',
    it: isMobile ? 'Tocca per iniziare' : 'Clicca per iniziare',
    nl: isMobile ? 'Tik om te beginnen' : 'Klik om te beginnen',
    cs: isMobile ? 'Klepněte pro start' : 'Klikněte pro start',
    id: isMobile ? 'Ketuk untuk mulai' : 'Klik untuk mulai',
    th: isMobile ? 'แตะเพื่อเริ่ม' : 'คลิกเพื่อเริ่ม',
    vi: isMobile ? 'Chạm để bắt đầu' : 'Nhấp để bắt đầu',
}

export const TEXT_LEVEL = {
    en: 'Level',
    ru: 'Уровень',
    tr: 'Seviye',
    es: 'Nivel',
    de: 'Level',
    pt: 'Nível',
    fr: 'Niveau',
    pl: 'Poziom',
    it: 'Livello',
    nl: 'Niveau',
    cs: 'Úroveň',
    id: 'Level',
    th: 'ระดับ',
    vi: 'Cấp độ',
}

export const TEXT_EMPTY = {
    en: '',
    ru: '',
    tr: '',
    es: '',
    de: '',
    pt: '',
    fr: '',
    pl: '',
    it: '',
    nl: '',
    cs: '',
    id: '',
    th: '',
    vi: '',
}