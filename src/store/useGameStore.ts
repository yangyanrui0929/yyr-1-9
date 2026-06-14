import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameState,
  Weather,
  Snack,
  Seat,
  Customer,
  Story,
  StoryBranch,
  InterruptionEvent,
  InterruptionOption,
  LedgerRecord,
  StoryRecord,
  ReputationHistory,
  Renovation,
  DreamFragment,
  DreamCombinationResult,
  Rumor,
} from '@/types'
import { STORIES } from '@/data/stories'
import { initSnacks } from '@/data/snacks'
import { initSeats } from '@/data/seats'
import { initRenovations, getUpgradeCost } from '@/data/renovations'
import { INTERRUPTIONS } from '@/data/interruptions'
import { generateRandomCustomers } from '@/data/customers'
import { calcSettlement } from '@/utils/settlement'
import { FRAGMENT_POOL, DREAM_RECIPES, getFragmentsForStory, generateRumorContent } from '@/data/dreamFragments'

const WEATHERS: Weather[] = ['晴', '晴', '晴', '云', '云', '雨', '雪']

function randomWeather(): Weather {
  return WEATHERS[Math.floor(Math.random() * WEATHERS.length)]
}

function pickRandomStories(count: number): Story[] {
  const pool = [...STORIES]
  const result: Story[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

function uid(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const initialState: GameState = {
  day: 1,
  phase: 'day',
  gold: 200,
  reputation: 30,
  weather: '晴',
  snacks: initSnacks(),
  seats: initSeats(),
  renovations: initRenovations(),
  customers: [],
  currentStory: null,
  currentBranch: null,
  storyProgress: 0,
  availableStories: [],
  interruptions: INTERRUPTIONS,
  currentInterruption: null,
  performanceActive: false,
  ledger: [],
  storyHistory: [],
  reputationHistory: [],
  lastStoryDay: {},
  storyScores: {},
  isSettlement: false,
  lastSettlement: null,
  dreamFragments: [],
  rumors: [],
  dreamEligible: false,
  dreamChecked: false,
  unlockedDreamBranches: [],
  showDreamModal: false,
  interruptionCount: 0,
  successfulInterruptions: 0,
  lastDreamResult: null,
}

interface GameActions {
  buySnack: (snackId: string, qty: number) => void
  moveSeat: (seatId: number, x: number, y: number) => void
  upgradeRenovation: (renoId: string) => void
  switchToNight: () => void
  selectStory: (storyId: string, branchId: string) => void
  startPerformance: () => void
  tickPerformance: () => void
  handleInterruption: (option: InterruptionOption) => void
  doSettlement: () => void
  nextDay: () => void
  resetGame: () => void
  addLedgerRecord: (type: LedgerRecord['type'], category: string, amount: number, note: string) => void
  checkDreamEligibility: () => void
  combineFragments: (characterId: string, locationId: string, conflictId: string) => DreamCombinationResult | null
  dismissDream: () => void
  openDreamModal: () => void
  closeDreamModal: () => void
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      buySnack: (snackId: string, qty: number) => {
        const state = get()
        const snack = state.snacks.find((s) => s.id === snackId)
        if (!snack) return
        const totalCost = snack.cost * qty
        if (state.gold < totalCost) return
        const newStock = Math.min(snack.maxStock, snack.stock + qty)
        const actualQty = newStock - snack.stock
        if (actualQty <= 0) return
        const actualCost = snack.cost * actualQty

        set((s) => ({
          gold: s.gold - actualCost,
          snacks: s.snacks.map((x) =>
            x.id === snackId ? { ...x, stock: newStock } : x
          ),
        }))
        get().addLedgerRecord('支出', '茶点采购', actualCost, `采购${snack.name} x${actualQty}`)
      },

      moveSeat: (seatId: number, x: number, y: number) => {
        set((s) => ({
          seats: s.seats.map((seat) =>
            seat.id === seatId ? { ...seat, x, y } : seat
          ),
        }))
      },

      upgradeRenovation: (renoId: string) => {
        const state = get()
        const reno = state.renovations.find((r) => r.id === renoId)
        if (!reno || reno.level >= reno.maxLevel) return
        const cost = getUpgradeCost(reno)
        if (state.gold < cost) return

        const repGain = reno.bonusReputation

        set((s) => ({
          gold: s.gold - cost,
          reputation: Math.min(100, s.reputation + repGain),
          renovations: s.renovations.map((r) =>
            r.id === renoId ? { ...r, level: r.level + 1 } : r
          ),
          reputationHistory: [
            ...s.reputationHistory,
            {
              day: s.day,
              value: Math.min(100, s.reputation + repGain),
              delta: repGain,
              reason: `装修升级：${reno.name}`,
            },
          ],
        }))
        get().addLedgerRecord('支出', '装修升级', cost, `升级${reno.name}至${reno.level + 1}级`)
      },

      switchToNight: () => {
        const state = get()
        const weather = state.weather
        let customerCount = 6
        if (weather === '雨') customerCount = Math.max(2, customerCount - 3)
        if (weather === '雪') customerCount = Math.max(2, customerCount - 4)
        if (weather === '云') customerCount = Math.max(3, customerCount - 1)
        if (state.reputation > 50) customerCount += 2
        if (state.reputation > 80) customerCount += 2

        const customers = generateRandomCustomers(customerCount)
        const seats = [...state.seats].map((s) => ({ ...s, occupied: false }))
        const sortedSeats = [...seats].sort((a, b) => {
          const order: Record<Seat['tier'], number> = { 贵宾: 0, 雅座: 1, 普通: 2 }
          return order[a.tier] - order[b.tier]
        })
        for (let i = 0; i < Math.min(customers.length, sortedSeats.length); i++) {
          const seat = sortedSeats[i]
          customers[i].seatId = seat.id
          const idx = seats.findIndex((s) => s.id === seat.id)
          if (idx >= 0) seats[idx].occupied = true
        }

        const availableStories = pickRandomStories(3)

        set({
          phase: 'night',
          customers,
          seats,
          availableStories,
          currentStory: null,
          currentBranch: null,
          storyProgress: 0,
          performanceActive: false,
          currentInterruption: null,
          interruptionCount: 0,
          successfulInterruptions: 0,
          dreamEligible: false,
          dreamChecked: false,
          showDreamModal: false,
          lastDreamResult: null,
        })
      },

      selectStory: (storyId: string, branchId: string) => {
        const state = get()
        const story = state.availableStories.find((s) => s.id === storyId)
        if (!story) return
        let branch = story.branches.find((b) => b.id === branchId)
        if (!branch) {
          branch = state.unlockedDreamBranches.find((b) => b.id === branchId) || null
        }
        if (!branch) return
        set({ currentStory: story, currentBranch: branch, storyProgress: 0 })
      },

      startPerformance: () => {
        const state = get()
        if (!state.currentStory || !state.currentBranch) return
        set({ performanceActive: true, storyProgress: 0 })
      },

      tickPerformance: () => {
        const state = get()
        if (!state.performanceActive) return

        const newProgress = Math.min(100, state.storyProgress + 4)

        if (!state.currentInterruption && Math.random() < 0.18 && state.storyProgress > 10 && state.storyProgress < 90) {
          const seatedCustomers = state.customers.filter((c) => c.seatId !== null)
          if (seatedCustomers.length > 0) {
            const c = seatedCustomers[Math.floor(Math.random() * seatedCustomers.length)]
            const matching = state.interruptions.filter((i) => i.customerType === c.type)
            const pool = matching.length > 0 ? matching : state.interruptions
            const ev = pool[Math.floor(Math.random() * pool.length)]
            set({ currentInterruption: ev, storyProgress: newProgress })
            return
          }
        }

        const customers = state.customers.map((c) => {
          if (c.seatId === null) return c
          let delta = Math.random() < 0.7 ? 1 : -1
          if (state.currentStory && state.currentBranch) {
            const match = state.currentBranch.tags.some((t) => c.preferenceTags.includes(t))
            if (match) delta += 1
          }
          return { ...c, satisfaction: Math.max(0, Math.min(100, c.satisfaction + delta)) }
        })

        if (newProgress >= 100) {
          set({ performanceActive: false, storyProgress: 100, customers })
          setTimeout(() => get().doSettlement(), 600)
        } else {
          set({ storyProgress: newProgress, customers })
        }
      },

      handleInterruption: (option: InterruptionOption) => {
        const state = get()
        if (!state.currentInterruption) return

        const customers = state.customers.map((c) => ({
          ...c,
          satisfaction: Math.max(0, Math.min(100, c.satisfaction + option.satisfactionEffect)),
        }))

        const newReputation = Math.max(0, Math.min(100, state.reputation + option.reputationEffect))
        const isSuccess = option.satisfactionEffect >= 0 && option.reputationEffect >= 0

        set({
          currentInterruption: null,
          customers,
          gold: state.gold + option.goldEffect,
          reputation: newReputation,
          interruptionCount: state.interruptionCount + 1,
          successfulInterruptions: state.successfulInterruptions + (isSuccess ? 1 : 0),
        })

        if (option.goldEffect !== 0) {
          get().addLedgerRecord(
            option.goldEffect > 0 ? '收入' : '支出',
            '插话应对',
            Math.abs(option.goldEffect),
            option.text.slice(0, 20)
          )
        }

        if (option.reputationEffect !== 0) {
          set((s) => ({
            reputationHistory: [
              ...s.reputationHistory,
              {
                day: s.day,
                value: newReputation,
                delta: option.reputationEffect,
                reason: option.reputationEffect > 0 ? '插话应对得当' : '插话处理失当',
              },
            ],
          }))
        }
      },

      doSettlement: () => {
        const state = get()
        if (!state.currentStory || !state.currentBranch) return

        const result = calcSettlement(
          state.day,
          state.currentStory,
          state.currentBranch,
          state.customers,
          state.seats,
          state.renovations,
          state.storyHistory,
          state.lastStoryDay,
          state.storyScores,
          state.reputation,
          state.snacks
        )

        const storyRecord: StoryRecord = {
          day: state.day,
          storyId: state.currentStory.id,
          branchId: state.currentBranch.id,
          audienceCount: result.audienceCount,
          earnings: result.totalEarnings,
          avgSatisfaction: result.avgSatisfaction,
        }

        const newStoryScores = { ...state.storyScores }
        if (!newStoryScores[state.currentStory.id]) {
          newStoryScores[state.currentStory.id] = []
        }
        newStoryScores[state.currentStory.id] = [
          ...newStoryScores[state.currentStory.id],
          result.avgSatisfaction,
        ].slice(-10)

        const newRep = Math.max(0, Math.min(100, state.reputation + result.reputationDelta))

        const repHistory: ReputationHistory = {
          day: state.day,
          value: newRep,
          delta: result.reputationDelta,
          reason: result.reputationDelta >= 0 ? '说书好评' : '差评影响',
        }

        set((s) => ({
          isSettlement: true,
          lastSettlement: result,
          gold: s.gold + result.totalEarnings,
          reputation: newRep,
          storyHistory: [...s.storyHistory, storyRecord],
          lastStoryDay: { ...s.lastStoryDay, [state.currentStory!.id]: state.day },
          storyScores: newStoryScores,
          reputationHistory: [...s.reputationHistory, repHistory],
        }))

        get().addLedgerRecord('收入', '基础门票', result.baseEarnings, '晚场门票')
        if (result.tasteMatchBonus > 0)
          get().addLedgerRecord('收入', '口味匹配', result.tasteMatchBonus, '故事对味')
        if (result.seatViewBonus > 0)
          get().addLedgerRecord('收入', '视野加成', result.seatViewBonus, '座位优良')
        if (result.storyHeatBonus > 0)
          get().addLedgerRecord('收入', '热度加成', result.storyHeatBonus, '故事热门')
        if (result.serialExpectBonus > 0)
          get().addLedgerRecord('收入', '连载期待', result.serialExpectBonus, '观众期待')
        if (result.tips > 0)
          get().addLedgerRecord('收入', '客人打赏', result.tips, '客人满意打赏')
        if (result.snackRevenue > 0)
          get().addLedgerRecord('收入', '茶点售卖', result.snackRevenue, '消费茶点')
        if (result.badReviewPenalty > 0)
          get().addLedgerRecord('支出', '差评损失', result.badReviewPenalty, '客人不满索赔')

        setTimeout(() => get().checkDreamEligibility(), 800)
      },

      nextDay: () => {
        set((s) => ({
          day: s.day + 1,
          phase: 'day',
          weather: randomWeather(),
          customers: [],
          currentStory: null,
          currentBranch: null,
          storyProgress: 0,
          availableStories: [],
          performanceActive: false,
          currentInterruption: null,
          isSettlement: false,
          seats: s.seats.map((seat) => ({ ...seat, occupied: false })),
        }))
      },

      resetGame: () => {
        set({ ...initialState, weather: randomWeather() })
      },

      addLedgerRecord: (type, category, amount, note) => {
        set((s) => ({
          ledger: [
            ...s.ledger,
            {
              day: s.day,
              id: uid(),
              type,
              category,
              amount,
              note,
              timestamp: Date.now(),
            },
          ],
        }))
      },

      checkDreamEligibility: () => {
        const state = get()
        if (!state.currentStory || !state.lastSettlement || state.dreamChecked) return

        const { avgSatisfaction } = state.lastSettlement
        const storyHeat = state.currentStory.heat + (state.currentBranch?.heatModifier || 0)
        const interruptionSuccessRate = state.interruptionCount > 0
          ? state.successfulInterruptions / state.interruptionCount
          : 1

        const satisfactionPass = avgSatisfaction >= 70
        const heatPass = storyHeat >= 60
        const interruptionPass = state.interruptionCount === 0 || interruptionSuccessRate >= 0.5

        const eligible = satisfactionPass && heatPass && interruptionPass

        if (eligible) {
          const storyId = state.currentStory.id
          const storyFragments = getFragmentsForStory(storyId)
          const storyRecipes = DREAM_RECIPES.filter((r) => r.storyId === storyId)

          const guaranteedFragments: DreamFragment[] = []

          for (const recipe of storyRecipes) {
            const charFrag = FRAGMENT_POOL.find((f) => f.id === recipe.characterId)
            const locFrag = FRAGMENT_POOL.find((f) => f.id === recipe.locationId)
            const confFrag = FRAGMENT_POOL.find((f) => f.id === recipe.conflictId)

            if (charFrag && !guaranteedFragments.some((f) => f.id === charFrag.id)) {
              guaranteedFragments.push(charFrag)
            }
            if (locFrag && !guaranteedFragments.some((f) => f.id === locFrag.id)) {
              guaranteedFragments.push(locFrag)
            }
            if (confFrag && !guaranteedFragments.some((f) => f.id === confFrag.id)) {
              guaranteedFragments.push(confFrag)
            }
          }

          const existingIds = state.dreamFragments.map((f) => f.id)
          const newFragments = guaranteedFragments.filter((f) => !existingIds.includes(f.id))

          const hasCharacters = newFragments.some((f) => f.type === 'character')
          const hasLocations = newFragments.some((f) => f.type === 'location')
          const hasConflicts = newFragments.some((f) => f.type === 'conflict')

          if (!hasCharacters || !hasLocations || !hasConflicts) {
            const extraPool = storyFragments.filter(
              (f) => !guaranteedFragments.some((g) => g.id === f.id) && !existingIds.includes(f.id)
            )
            const shuffled = [...extraPool].sort(() => Math.random() - 0.5)

            if (!hasCharacters) {
              const char = shuffled.find((f) => f.type === 'character')
              if (char) newFragments.push(char)
            }
            if (!hasLocations) {
              const loc = shuffled.find((f) => f.type === 'location')
              if (loc) newFragments.push(loc)
            }
            if (!hasConflicts) {
              const conf = shuffled.find((f) => f.type === 'conflict')
              if (conf) newFragments.push(conf)
            }
          }

          const uniqueNewFragments = newFragments.filter(
            (frag, index, self) => self.findIndex((f) => f.id === frag.id) === index
          )

          set((s) => ({
            dreamEligible: true,
            dreamChecked: true,
            dreamFragments: [...s.dreamFragments, ...uniqueNewFragments],
            showDreamModal: true,
          }))
        } else {
          set({ dreamEligible: false, dreamChecked: true })
        }
      },

      combineFragments: (characterId: string, locationId: string, conflictId: string) => {
        const state = get()

        const character = FRAGMENT_POOL.find((f) => f.id === characterId)
        const location = FRAGMENT_POOL.find((f) => f.id === locationId)
        const conflict = FRAGMENT_POOL.find((f) => f.id === conflictId)

        if (!character || !location || !conflict) return null

        const recipe = DREAM_RECIPES.find(
          (r) => r.characterId === characterId && r.locationId === locationId && r.conflictId === conflictId
        )

        if (recipe) {
          const alreadyUnlocked = state.unlockedDreamBranches.some((b) => b.id === recipe.hiddenBranch.id)
          if (!alreadyUnlocked) {
            set((s) => ({
              unlockedDreamBranches: [...s.unlockedDreamBranches, recipe.hiddenBranch],
              lastDreamResult: {
                success: true,
                hiddenBranch: recipe.hiddenBranch,
              },
            }))
          } else {
            set({
              lastDreamResult: {
                success: true,
                hiddenBranch: recipe.hiddenBranch,
              },
            })
          }
          return { success: true, hiddenBranch: recipe.hiddenBranch }
        } else {
          const rumorContent = generateRumorContent(character.name, location.name, conflict.name)
          const rumor = {
            id: `rumor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            day: state.day,
            title: rumorContent.title,
            content: rumorContent.content,
            fragments: { character: character.name, location: location.name, conflict: conflict.name },
            timestamp: Date.now(),
          }

          const repPenalty = Math.floor(Math.random() * 5) + 1
          const newRep = Math.max(0, state.reputation - repPenalty)

          set((s) => ({
            rumors: [...s.rumors, rumor],
            reputation: newRep,
            reputationHistory: [
              ...s.reputationHistory,
              {
                day: s.day,
                value: newRep,
                delta: -repPenalty,
                reason: '荒腔走板传闻流传',
              },
            ],
            lastDreamResult: {
              success: false,
              rumor,
            },
          }))

          return { success: false, rumor }
        }
      },

      dismissDream: () => {
        set({ showDreamModal: false, lastDreamResult: null })
      },

      openDreamModal: () => {
        const state = get()
        if (state.dreamEligible) {
          set({ showDreamModal: true })
        }
      },

      closeDreamModal: () => {
        set({ showDreamModal: false })
      },
    }),
    {
      name: 'teahouse-storyteller-save',
      partialize: (s) => ({
        day: s.day,
        gold: s.gold,
        reputation: s.reputation,
        snacks: s.snacks,
        seats: s.seats,
        renovations: s.renovations,
        ledger: s.ledger,
        storyHistory: s.storyHistory,
        reputationHistory: s.reputationHistory,
        lastStoryDay: s.lastStoryDay,
        storyScores: s.storyScores,
        dreamFragments: s.dreamFragments,
        rumors: s.rumors,
        unlockedDreamBranches: s.unlockedDreamBranches,
      }),
    }
  )
)
