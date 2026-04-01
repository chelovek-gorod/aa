import { EventHub, events, getNextLevel } from "../app/events"
import { updateStoredData } from "../game/storage"
import { createEnum } from "../utils/functions"

export let isAdAvailable = true

export const LEVEL_TYPE = createEnum(['GROUND', 'WATER', 'SNOW'])
export let levelType = LEVEL_TYPE.GROUND

export let playerAvatarsShop = {
    player_1: 0, // set 0 if can be used
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
export let playerScoreX2 = 0
export let playerTarget = 10 // score for next level
export let playerPrevious = 0 // score before next level
export let playerProgress = 0 // score rate for next level
export function playerAddScore(score) {
    playerScore += score
    if (playerScore >= playerTarget) {
        playerPrevious = playerTarget
        playerLevel++
        playerCoins++
        playerTarget += Math.floor(playerLevel * 1.2) * 10
        getNextLevel()
    }           
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)
}
export function playerUseCoins(count) {
    playerCoins -= count
}
export function playerAddCoins(count) {
    playerCoins += count
}
export function playerUseSave() {
    playerSaves--
}
export function playerAddSave(count) {
    playerSaves += count
}
export function resetScoreToPrevious() {
    playerSaves = 0
    playerScore = playerPrevious
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)

    levelType = playerLevel % 5 === 0
        ? LEVEL_TYPE.SNOW : playerLevel % 3 === 0
        ? LEVEL_TYPE.WATER : LEVEL_TYPE.GROUND
}

export function getStateData() {

}

export function setStoredState() {
    
}