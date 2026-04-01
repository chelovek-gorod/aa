import { EventHub, events, getNextLevel } from "../app/events"
import { updateStoredData } from "../game/storage"
import { createEnum } from "../utils/functions"

export let isAdAvailable = true

export const LEVEL_TYPE = createEnum(['GROUND', 'WATER', 'SNOW'])
export let levelType = LEVEL_TYPE.GROUND

export let playerAvatarsShop = {
    player_1: 0, // set 0 if purchased
    player_2: 5,
    player_3: 7,
    player_4: 10,
    player_5: 15,
    player_6: 25,
    player_7: 35,
    player_8: 50,
    player_9: 70,
}
export let playerAvatarKeys = Object.keys(playerAvatarsShop)
export let playerAvatarIndex = Math.min( 0, playerAvatarKeys.length - 1)
export function nextAvatar() {
    let index = playerAvatarIndex + 1
    if (index === playerAvatarKeys.length) index = 0
    playerAvatarIndex = index
}

export let playerCoins = 0
export let playerSaves = 0
export let playerLevel = 1
export let playerScore = 0
export let playerScoreX2 = 0 // additionalScoreRate
export let isPlayerScoreX2Active = false
export let isPlayerScoreX2Apply = false
export let playerTarget = 20 // score for next level
export let playerPrevious = 0 // score before next level
export let playerProgress = 0 // score rate for next level
export function playerAddScore(score) {
    playerScore += score * (isPlayerScoreX2Active ? 2 : 1)
    if (playerScore >= playerTarget) {
        playerPrevious = playerTarget
        playerLevel++
        playerCoins++
        playerTarget += Math.floor(playerLevel * 1.2) * 20
        getNextLevel()
    }           
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)

    if (isPlayerScoreX2Active && !isPlayerScoreX2Apply) {
        playerScoreX2 = Math.max(0, playerScoreX2 - 1)
        isPlayerScoreX2Apply = true
    }
}
export function playerUseCoins(count) {
    playerCoins -= count
}
export function playerAddCoins(count) {
    playerCoins += count
}
export function playerUseSave() {
    playerSaves--
    isPlayerScoreX2Active = false
}
export function playerAddSave(count) {
    playerSaves += count
}
export function playerAddScoreX2(count) {
    isPlayerScoreX2Active = true
    playerScoreX2 += count
}

export function resetScoreToPrevious() {
    playerSaves = 0
    playerScore = playerPrevious
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)

    isPlayerScoreX2Apply = false
    if (playerScoreX2 > 0) isPlayerScoreX2Active = true

    levelType = playerLevel % 5 === 0
        ? LEVEL_TYPE.SNOW : playerLevel % 3 === 0
        ? LEVEL_TYPE.WATER : LEVEL_TYPE.GROUND
}

export function getStateData() {

}

export function setStoredState() {
    
}