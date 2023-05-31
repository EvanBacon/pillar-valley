import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "expo-firebase-analytics";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import Challenges from "../constants/Achievements";
import GameStates from "../Game/GameStates";

export type PresentAchievementShape = null | {
  id: string;
  name: string;
};

export type ScoreShape = {
  current: number;
  best: number;
  total: number;
  last: number | null;
  isBest: boolean;
};

const initialScoreState: ScoreShape = {
  current: 0,
  best: 0,
  total: 0,
  last: null,
  isBest: false,
};

export const useGlobalAudio = create(
  persist<{
    muted: boolean;
    toggleMuted(): void;
  }>(
    (set) => ({
      muted: false,
      toggleMuted: () =>
        set((state) => {
          Analytics.logEvent("toggle_music", { on: !state.muted });
          return { ...state, muted: !state.muted };
        }),
    }),
    {
      name: "useGlobalAudio",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const usePresentAchievement = create<{
  presentAchievement: null | { id: string; name: string };
  set(val: null | { id: string; name: string }): void;
}>((set) => ({
  presentAchievement: null,
  set: (val) => set((state) => ({ ...state, presentAchievement: val })),
}));

export const useCurrency = create(
  persist<{
    currency: number;
    resetCurrency(): void;
    changeCurrency(val: number): void;
  }>(
    (set) => ({
      currency: 0,

      // For `currency`
      changeCurrency: (value) =>
        set((state) => ({
          ...state,
          currency: state.currency + value,
        })),
      resetCurrency: () =>
        set((state) => ({
          ...state,
          currency: 0,
        })),
    }),
    {
      name: "useCurrency", // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useGameState = create<{
  game: GameStates;
  playGame(): void;
  menuGame(): void;
}>((set) => ({
  game: GameStates.Menu,
  playGame: () => set(() => ({ game: GameStates.Playing })),
  menuGame: () => set(() => ({ game: GameStates.Menu })),
}));

export const useGameScreenshot = create<{
  screenshot: null | string;
  updateScreenshot(uri: string): void;
}>((set) => ({
  screenshot: null,
  updateScreenshot: (uri) =>
    set(() => {
      // const { width, height } = Dimensions.get("window");
      // const uri = await captureRef(ref, {
      //   format: "jpg",
      //   quality: 0.3,
      //   result: "tmpfile",
      //   // result: "file",
      //   height,
      //   width,
      // });
      // dispatch.screenshot.update(uri);

      return { screenshot: uri };
    }),
}));

export const useScore = create(
  persist<{
    score: {
      current: number;
      best: number;
      total: number;
      last: number | null;
      isBest: boolean;
    };
    hardResetScore(): void;
    incrementScore(): void;
    resetScore(): void;
    updateTotal(current: number): void;
    setHighScore(score: number): void;
  }>(
    (set) => ({
      score: {
        current: 0,
        best: 0,
        total: 0,
        last: null,
        isBest: false,
      },

      setHighScore(score: number) {
        useRounds.getState().incrementBestRounds();
      },

      // For `score`
      hardResetScore: () =>
        set((state) => ({
          ...state,
          score: { ...initialScoreState },
        })),

      incrementScore: () =>
        set((state) => {
          const nextScore = state.score.current + 1;

          return {
            ...state,
            score: {
              ...state.score,
              current: nextScore,
              best: Math.max(nextScore, state.score.best),
              isBest: nextScore > state.score.best,
            },
          };
        }),
      resetScore: () =>
        set((state) => ({
          ...state,
          score: {
            ...state.score,
            current: 0,
            last: state.score.current,
            isBest: false,
          },
        })),

      updateTotal(current: number) {
        set((state) => {
          const total = state.score.total + current;

          if (current > 100) {
            useAchievements.getState().unlock("score-100");
          } else if (current > 50) {
            useAchievements.getState().unlock("score-50");
          } else if (current > 20) {
            useAchievements.getState().unlock("score-20");
          }

          if (total > 10000) {
            useAchievements.getState().unlock("total-score-10000");
          } else if (total > 5000) {
            useAchievements.getState().unlock("total-score-5000");
          } else if (total > 1000) {
            useAchievements.getState().unlock("total-score-1000");
          } else if (total > 500) {
            useAchievements.getState().unlock("total-score-500");
          }

          return { ...state, score: { ...state.score, total } };
        });
      },
    }),
    {
      name: "useScore", // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useAchievements = create(
  persist<{
    achievements: Record<string, true>;
    resetAchievements(): void;
    setAchievements(val: Record<string, true>): void;
    unlock(key: string): void;
  }>(
    (set) => ({
      achievements: {},
      // For `achievements`
      resetAchievements: () => set((state) => ({ ...state, achievements: {} })),
      setAchievements: (val) =>
        set((state) => ({
          ...state,
          achievements: { ...state.achievements, ...val },
        })),

      unlock: (key: string) => {
        set((state) => {
          if (!state.achievements[key] && Challenges[key]) {
            Analytics.logEvent("achievement_unlocked", {
              id: [key],
              ...Challenges[key],
            });
          }

          usePresentAchievement.getState().set({ id: key, ...Challenges[key] });

          return {
            ...state,
            achievements: { ...state.achievements, [key]: true },
          };
        });
      },
    }),
    {
      name: "useAchievements", // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useRounds = create(
  persist<{
    bestRounds: number;
    rounds: number;

    resetBestRounds(): void;
    setBestRounds(val: number): void;
    resetRounds(): void;
    setRounds(value: any): void;

    incrementRounds(): void;
    incrementBestRounds(): void;
  }>(
    (set) => ({
      bestRounds: 0,
      rounds: 0,

      // Reducers

      incrementBestRounds: () => {
        set((state) => {
          const next = state.bestRounds + 1;

          Analytics.logEvent("had_best_round", {
            count: state.bestRounds,
            score: useScore.getState().score.total,
          });

          // if the user ever beats their highscore twice after the first day of using the app, prompt them to rate the app.
          if (state.bestRounds > 1) {
            // dispatch.storeReview.promptAsync();
          }

          return {
            ...state,
            bestRounds: next,
          };
        });
      },

      // For `bestRounds`
      resetBestRounds: () => set((state) => ({ ...state, bestRounds: 0 })),
      setBestRounds: (val) => set((state) => ({ ...state, bestRounds: val })),

      // For `rounds`
      resetRounds: () => set((state) => ({ ...state, rounds: 0 })),
      setRounds: (val) => set((state) => ({ ...state, rounds: val })),

      incrementRounds: () =>
        set((state) => {
          const next = state.rounds + 1;

          // Unlock achievements
          if (next === 10) {
            Analytics.logEvent("achievement_unlocked", {
              id: "rounds-10",
              ...Challenges["rounds-10"],
            });
            useAchievements.getState().unlock("rounds-10");
          } else if (next === 50) {
            Analytics.logEvent("achievement_unlocked", {
              id: "rounds-50",
              ...Challenges["rounds-50"],
            });
            useAchievements.getState().unlock("rounds-50");
          } else if (next === 100) {
            Analytics.logEvent("achievement_unlocked", {
              id: "rounds-100",
              ...Challenges["rounds-100"],
            });
            useAchievements.getState().unlock("rounds-100");
          } else if (next === 500) {
            Analytics.logEvent("achievement_unlocked", {
              id: "rounds-500",
              ...Challenges["rounds-500"],
            });
            useAchievements.getState().unlock("rounds-500");
          } else if (next === 1000) {
            Analytics.logEvent("achievement_unlocked", {
              id: "rounds-1000",
              ...Challenges["rounds-1000"],
            });
            useAchievements.getState().unlock("rounds-1000");
          }

          return { ...state, rounds: next };
        }),
    }),
    {
      name: "useRounds", // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
