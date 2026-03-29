import { EventHub, events, getNextLevel } from "../app/events"
import { updateStoredData } from "../game/storage"

export let isAdAvailable = true

export let playerCoins = 0
export let playerSaves = 3
export let playerLevel = 1
export let playerScore = 0
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
}


export function getStateData() {

}

export function setStoredState() {
    
}