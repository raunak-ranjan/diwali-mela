import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { KNOWN_COSMETICS, type CosmeticItem } from '../../types/rewards';
import {
  Coins,
  X,
  Sparkles,
  Trophy,
  Shirt,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const RewardsProgressionModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const tokens = useGameStore((s) => s.tokens);
  const stats = useGameStore((s) => s.stats);
  const quest = useGameStore((s) => s.quest);
  const cosmetics = useGameStore((s) => s.cosmetics);
  const tokenHistory = useGameStore((s) => s.tokenHistory);
  const unlockCosmetic = useGameStore((s) => s.unlockCosmetic);
  const equipCosmetic = useGameStore((s) => s.equipCosmetic);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const [activeTab, setActiveTab] = useState<'wallet' | 'wardrobe' | 'progression'>('wardrobe');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (activeModal !== 'rewards') return null;

  const animClass = reducedMotion ? '' : 'animate-in fade-in duration-200';
  const toastAnim = reducedMotion ? '' : 'animate-pulse';

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2500);
  };

  const handleUnlock = (item: CosmeticItem) => {
    if (tokens < item.price) {
      showFeedback(`Insufficient tokens! Need ${item.price - tokens} more.`);
      return;
    }
    const success = unlockCosmetic(item.id);
    if (success) {
      showFeedback(`Unlocked ${item.name}!`);
    }
  };

  const handleToggleEquip = (itemId: string) => {
    if (cosmetics.equipped === itemId) {
      equipCosmetic(null);
      showFeedback('Cosmetic unequipped.');
    } else {
      equipCosmetic(itemId);
      const item = KNOWN_COSMETICS.find((c) => c.id === itemId);
      showFeedback(`Equipped ${item?.name || 'cosmetic'}!`);
    }
  };

  // Authoritative calculations
  const totalEarned = stats.totalTokensEarned ?? tokens;
  const totalSpent = Math.max(0, totalEarned - tokens);
  const cosmeticsUnlockedCount = cosmetics.unlocked.length;
  const equippedItem = KNOWN_COSMETICS.find((c) => c.id === cosmetics.equipped);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewards-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md ${animClass}`}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/95 border-2 border-festive-gold/60 rounded-3xl shadow-2xl shadow-amber-500/20 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 shadow-md shrink-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2
                id="rewards-modal-title"
                className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-festive-gold to-yellow-100"
              >
                Festival Rewards & Progression
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">Manage your festival tokens, wardrobe, and achievements</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Balance Pill */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-festive-gold/50 rounded-full px-2.5 sm:px-3 py-1 shrink-0">
              <span className="text-[10px] sm:text-xs uppercase text-amber-300 font-bold hidden xs:inline">Balance:</span>
              <span className="text-xs sm:text-base font-black text-festive-gold font-mono">{tokens} 🪙</span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-festive-gold/50 rounded-t-lg ${
              activeTab === 'wardrobe'
                ? 'border-festive-gold text-festive-gold bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Wardrobe & Cosmetics</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
              {cosmeticsUnlockedCount}/{KNOWN_COSMETICS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-festive-gold/50 rounded-t-lg ${
              activeTab === 'wallet'
                ? 'border-festive-gold text-festive-gold bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Festival Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('progression')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-festive-gold/50 rounded-t-lg ${
              activeTab === 'progression'
                ? 'border-festive-gold text-festive-gold bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Achievements</span>
          </button>
        </div>

        {/* Feedback Toast if any */}
        {feedbackMsg && (
          <div className={`bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 text-center font-medium ${toastAnim}`}>
            {feedbackMsg}
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ── TAB 1: WARDROBE & COSMETICS ── */}
          {activeTab === 'wardrobe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-festive-gold" />
                    Festive Aura & Cosmetics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Equip visual effects that shine in the 3D mela without altering gameplay mechanics.
                  </p>
                </div>
                {equippedItem && (
                  <div className="text-xs bg-emerald-950/60 border border-emerald-500/40 rounded-full px-3 py-1 text-emerald-300 font-medium">
                    Active: <strong className="text-white">{equippedItem.name}</strong>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {KNOWN_COSMETICS.map((item) => {
                  const isOwned = cosmetics.unlocked.includes(item.id);
                  const isEquipped = cosmetics.equipped === item.id;
                  const canAfford = tokens >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                        isEquipped
                          ? 'bg-amber-950/30 border-festive-gold shadow-md shadow-amber-500/10 ring-1 ring-festive-gold/50'
                          : isOwned
                          ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top metadata */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700 shadow-inner">
                              {item.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-white text-sm leading-tight">{item.name}</h4>
                                <span className="text-[10px] text-amber-300/80 font-hindi">({item.hindiName})</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                  item.rarity === 'legendary'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : item.rarity === 'epic'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {item.rarity}
                              </span>
                            </div>
                          </div>

                          {/* Price Tag or Owned Badge */}
                          {isOwned ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Owned
                            </span>
                          ) : (
                            <span className="font-mono text-xs font-black text-festive-gold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                              {item.price} 🪙
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{item.description}</p>
                        <p className="text-[11px] text-amber-400/80 mt-1 italic">✦ {item.unlockCondition}</p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {isOwned ? (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {isEquipped ? 'Currently shining in mela' : 'Ready to equip'}
                            </span>
                            <button
                              onClick={() => handleToggleEquip(item.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isEquipped
                                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              }`}
                            >
                              {isEquipped ? 'Unequip' : 'Equip'}
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {canAfford ? 'Affordable now' : `Need ${item.price - tokens} more 🪙`}
                            </span>
                            <button
                              disabled={!canAfford}
                              onClick={() => handleUnlock(item)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:brightness-110 text-white shadow-md shadow-amber-500/20 active:scale-95'
                                  : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                              }`}
                            >
                              {canAfford ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Unlock for {item.price} 🪙
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Locked ({item.price} 🪙)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: FESTIVAL WALLET & LEDGER ── */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-festive-gold/40 p-4 rounded-2xl">
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Spendable Balance</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Coins className="w-5 h-5 text-festive-gold" />
                    <span className="text-2xl font-black text-white font-mono">{tokens}</span>
                    <span className="text-xs text-festive-gold font-bold">Tokens</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Earned</span>
                  <div className="flex items-center gap-2 mt-1">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xl font-black text-white font-mono">{totalEarned}</span>
                    <span className="text-xs text-slate-400">Tokens</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Spent</span>
                  <div className="flex items-center gap-2 mt-1">
                    <ArrowDownRight className="w-5 h-5 text-amber-400" />
                    <span className="text-2xl font-black text-white font-mono">{totalSpent}</span>
                    <span className="text-xs text-slate-400">Tokens</span>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Recent Festival Ledger
                  </h4>
                  <span className="text-[11px] text-slate-400">Last {tokenHistory.length} events</span>
                </div>

                {tokenHistory.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No transactions recorded yet. Explore the mela to earn tokens!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto pr-1">
                    {tokenHistory
                      .slice()
                      .reverse()
                      .map((tx) => {
                        const isIncome = tx.amount > 0;
                        const dateFormatted = new Date(tx.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isIncome
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-200 block">{tx.source}</span>
                                <span className="text-[10px] text-slate-500">{dateFormatted}</span>
                              </div>
                            </div>

                            <span
                              className={`font-mono font-bold ${
                                isIncome ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {isIncome ? `+${tx.amount}` : tx.amount} 🪙
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: ACHIEVEMENTS & PROGRESSION ── */}
          {activeTab === 'progression' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Sacred Diyas Quest */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-festive-gold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">The Five Sacred Lights</h4>
                      {quest.isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {quest.collectedDiyas.length} / {quest.targetCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Kindle all 5 Sacred Golden Diyas hidden around the fairground.
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (quest.collectedDiyas.length / quest.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Diya Kindler */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Festival Illuminator</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Total festive earthen diyas lit across the mela pathways.
                    </p>
                    <span className="text-base font-black text-white font-mono mt-1 block">
                      {stats.diyasLitCount || 0} Diyas Lit
                    </span>
                  </div>
                </div>

                {/* 3. Rangoli Artistry */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">Master of Rangoli</h4>
                      {stats.rangoliCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Mastered
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          Uncompleted
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Decorate the central ceremonial plaza with traditional colored powders.
                    </p>
                  </div>
                </div>

                {/* 4. Carnival Games */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Booth Champion</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Highest score in the Balloon Shooting Gallery booth.
                    </p>
                    <span className="text-base font-black text-white font-mono mt-1 block">
                      {stats.balloonHighScore || 0} Pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Diwali Mela Festival Progression &copy; 2026</span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
