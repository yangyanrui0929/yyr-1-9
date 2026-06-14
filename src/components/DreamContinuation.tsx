import { useState, useMemo } from 'react'
import { X, Sparkles, BookOpen, Moon, Puzzle, AlertTriangle, Trophy } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import type { DreamFragment } from '@/types'

export default function DreamContinuation() {
  const {
    showDreamModal,
    dreamFragments,
    lastDreamResult,
    combineFragments,
    dismissDream,
    closeDreamModal,
    unlockedDreamBranches,
    currentStory,
  } = useGameStore()

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const characters = useMemo(
    () => dreamFragments.filter((f) => f.type === 'character'),
    [dreamFragments]
  )
  const locations = useMemo(
    () => dreamFragments.filter((f) => f.type === 'location'),
    [dreamFragments]
  )
  const conflicts = useMemo(
    () => dreamFragments.filter((f) => f.type === 'conflict'),
    [dreamFragments]
  )

  const canCombine = selectedCharacter && selectedLocation && selectedConflict

  const handleCombine = () => {
    if (!canCombine) return
    const result = combineFragments(selectedCharacter!, selectedLocation!, selectedConflict!)
    if (result) {
      setShowResult(true)
    }
  }

  const handleReset = () => {
    setSelectedCharacter(null)
    setSelectedLocation(null)
    setSelectedConflict(null)
    setShowResult(false)
  }

  const handleClose = () => {
    handleReset()
    dismissDream()
  }

  const handleCloseOnly = () => {
    handleReset()
    closeDreamModal()
  }

  if (!showDreamModal) return null

  return (
    <div className="fixed inset-0 bg-ink/70 z-50 flex items-center justify-center p-4 overflow-auto py-8">
      <div className="scroll-panel max-w-3xl w-full my-8 relative animate-unroll">
        <button
          onClick={handleCloseOnly}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-sandal/20 transition-colors text-ink-light hover:text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {!showResult ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 border-2 border-indigo-300 mb-3">
                <Moon className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="font-brush text-3xl text-sandal mb-2">梦境续书</h2>
              <p className="text-sm text-ink-light max-w-md mx-auto">
                今夜的故事深入人心，你在梦中获得了若干灵感碎片。
                将人物、地点、冲突三块碎片拼合，或许能解锁隐藏的分支剧情……
                但若是拼错了，只怕会传出荒腔走板的笑话来。
              </p>
            </div>

            <div className="divider-ancient text-sm font-brush">
              <Puzzle className="w-4 h-4" /> 灵感碎片
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <FragmentSection
                title="人物"
                type="character"
                fragments={characters}
                selectedId={selectedCharacter}
                onSelect={setSelectedCharacter}
                color="text-rose-600 bg-rose-50 border-rose-200"
                selectedColor="border-rose-500 ring-rose-300 bg-rose-100"
              />
              <FragmentSection
                title="地点"
                type="location"
                fragments={locations}
                selectedId={selectedLocation}
                onSelect={setSelectedLocation}
                color="text-emerald-600 bg-emerald-50 border-emerald-200"
                selectedColor="border-emerald-500 ring-emerald-300 bg-emerald-100"
              />
              <FragmentSection
                title="冲突"
                type="conflict"
                fragments={conflicts}
                selectedId={selectedConflict}
                onSelect={setSelectedConflict}
                color="text-amber-600 bg-amber-50 border-amber-200"
                selectedColor="border-amber-500 ring-amber-300 bg-amber-100"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleReset} className="btn-wood">
                重置选择
              </button>
              <button
                onClick={handleCombine}
                disabled={!canCombine}
                className="btn-gold"
              >
                <Sparkles className="w-4 h-4" /> 拼合碎片
              </button>
            </div>

            {unlockedDreamBranches.length > 0 && currentStory && (
              <div className="mt-6 pt-4 border-t border-sandal/20">
                <div className="text-sm text-ink-light mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  已解锁的梦境分支（{unlockedDreamBranches.length}）
                </div>
                <div className="flex flex-wrap gap-2">
                  {unlockedDreamBranches.map((b) => (
                    <span
                      key={b.id}
                      className="px-3 py-1 rounded-full text-xs bg-gold/20 text-gold border border-gold/40"
                    >
                      {b.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-unroll">
            {lastDreamResult?.success ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 border-2 border-gold mb-4 animate-pulse">
                  <BookOpen className="w-10 h-10 text-gold" />
                </div>
                <h2 className="font-brush text-3xl text-gold mb-2">梦境成真！</h2>
                <p className="text-sm text-ink-light mb-6">
                  碎片完美契合，一段隐藏的剧情在你脑海中浮现……
                </p>

                <div className="card-ancient text-left mb-6 border-2 border-gold">
                  <div className="font-brush text-xl text-sandal mb-2">
                    {lastDreamResult.hiddenBranch?.title}
                  </div>
                  <div className="font-song text-ink leading-relaxed mb-3">
                    {lastDreamResult.hiddenBranch?.content}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lastDreamResult.hiddenBranch?.tags.map((t) => (
                      <span key={t} className="tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-ink-light">
                    热度加成：
                    <span className="text-cinnabar font-semibold">
                      +{lastDreamResult.hiddenBranch?.heatModifier}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-tea mb-6">
                  ✨ 此分支已解锁，今后选择相关故事时可体验梦境剧情！
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cinnabar/10 border-2 border-cinnabar/40 mb-4">
                  <AlertTriangle className="w-10 h-10 text-cinnabar" />
                </div>
                <h2 className="font-brush text-3xl text-cinnabar mb-2">荒腔走板</h2>
                <p className="text-sm text-ink-light mb-6">
                  碎片拼凑得牛头不对马嘴，一段荒诞的传闻在坊间流传开来……
                </p>

                <div className="card-ancient text-left mb-6 border-2 border-cinnabar/30">
                  <div className="font-brush text-xl text-cinnabar mb-2">
                    {lastDreamResult.rumor?.title}
                  </div>
                  <div className="font-song text-ink leading-relaxed">
                    {lastDreamResult.rumor?.content}
                  </div>
                </div>

                <div className="text-sm text-cinnabar mb-4">
                  ⚠ 传闻败坏了茶楼的名声，声望有所下降
                </div>

                <button
                  onClick={handleReset}
                  className="btn-wood"
                >
                  再试一次
                </button>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button onClick={handleClose} className="btn-gold">
                离开梦境
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface FragmentSectionProps {
  title: string
  type: 'character' | 'location' | 'conflict'
  fragments: DreamFragment[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  color: string
  selectedColor: string
}

function FragmentSection({
  title,
  fragments,
  selectedId,
  onSelect,
  color,
  selectedColor,
}: FragmentSectionProps) {
  return (
    <div>
      <div className={`text-sm font-semibold mb-2 ${color.split(' ')[0]}`}>{title}</div>
      <div className="space-y-2">
        {fragments.length === 0 ? (
          <div className="text-xs text-ink-light italic">暂无此类碎片</div>
        ) : (
          fragments.map((frag) => {
            const isSelected = selectedId === frag.id
            return (
              <div
                key={frag.id}
                onClick={() => onSelect(isSelected ? null : frag.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${selectedColor} ring-2 scale-[1.02]`
                    : `${color.split(' ').slice(1).join(' ')} hover:scale-[1.01] hover:shadow-md`
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{frag.emoji}</span>
                  <span className="font-semibold text-ink">{frag.name}</span>
                </div>
                <div className="text-xs text-ink-light">{frag.description}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
