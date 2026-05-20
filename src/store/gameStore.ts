import { defineStore } from 'pinia';

export interface Horse {
  id: number;
  name: string;
  condition: number;
  color: string;
  position: number;
  finishTime?: number;
  finished?: boolean;
}

export interface RaceSchedule {
  distance: number;
  horses: Horse[];
}

const RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200];

export const useGameStore = defineStore('game', {
  state: () => ({
    horsePool: [] as Horse[],
    currentRaceIndex: 0,
    isRaceRunning: false,
    raceProgram: RACE_DISTANCES,
    schedule: [] as RaceSchedule[],
    results: [] as Array<Horse[]>,
    animationFrameId: null as number | null,

    // Timing
    raceStartTime: 0,
    lastFrameTime: 0,
  }),

  getters: {
    activeRaceHorses(): Horse[] {
      if (this.schedule[this.currentRaceIndex]) {
        return this.schedule[this.currentRaceIndex].horses;
      }

      return [];
    }
  },

  actions: {
    generateHorsePool() {
      const names = [
        'Bold Pilot',
        'Asilhan',
        'Rüzgar',
        'Şahbatur',
        'Gülbatur',
        'Storm',
        'Thunder',
        'Black Beauty',
        'Pegasus',
        'Eclipse',
        'Gazi',
        'Yıldırım',
        'Poyraz',
        'Dolunay',
        'Gece',
        'Ateş',
        'Savaşçı',
        'Efsane',
        'Asil',
        'Rüzgar Gülü'
      ];

      this.horsePool = Array.from({ length: 20 }, (_, i) => {
        const hue = (i * 18) % 360;

        return {
          id: i + 1,
          name: names[i] || `Horse ${i + 1}`,
          condition: Math.floor(Math.random() * 100) + 1,
          color: `hsl(${hue}, 70%, 50%)`,
          position: 0,
          finishTime: undefined,
          finished: false,
        };
      });

      this.generateProgram();
    },

    generateProgram() {
      this.results = [];
      this.currentRaceIndex = 0;
      this.isRaceRunning = false;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.schedule = this.raceProgram.map((distance) => {
        // Karıştır
        const shuffled = [...this.horsePool].sort(
          () => Math.random() - 0.5
        );

        // 10 at seç
        const selectedHorses = shuffled.slice(0, 10).map((horse) => ({
          ...horse,
          position: 0,
          finishTime: undefined,
          finished: false,
        }));

        return {
          distance,
          horses: selectedHorses,
        };
      });
    },

    startRace() {
      if (
        this.isRaceRunning ||
        this.currentRaceIndex >= this.schedule.length
      ) {
        return;
      }

      this.raceStartTime = performance.now();
      this.lastFrameTime = performance.now();

      this.isRaceRunning = true;

      this.gameLoop();
    },

    pauseRace() {
      this.isRaceRunning = false;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    },

    gameLoop() {
      if (!this.isRaceRunning) return;

      const now = performance.now();

      // FPS bağımsız sistem
      const deltaTime = (now - this.lastFrameTime) / 16.67;

      this.lastFrameTime = now;

      const currentRace = this.schedule[this.currentRaceIndex];
      const currentDistance = currentRace.distance;

      currentRace.horses.forEach((horse) => {
        if (horse.finished) return;

        // Temel hız
        const baseSpeed = 0.18;

        // Kondisyon bonusu
        const conditionFactor =
          (horse.condition / 100) * 0.15;

        // Rastgele tempo
        const rngFactor = Math.random() * 0.20;

        // Kısa yarışlar daha hızlı
        const distanceModifier = 2000 / currentDistance;

        // Final hız
        const tickProgress =
          (
            baseSpeed +
            conditionFactor +
            rngFactor
          ) *
          distanceModifier;

        // Delta time ile FPS bağımsız ilerleme
        horse.position += tickProgress * deltaTime;

        // Finish
        if (horse.position >= 100) {
          horse.position = 100;
          horse.finished = true;

          // Finish zamanı
          horse.finishTime =
            performance.now() - this.raceStartTime;
        }
      });

      // Herkes finish yaptı mı?
      const allFinished = currentRace.horses.every(
        (horse) => horse.finished
      );

      if (allFinished) {
        this.handleRaceFinish();
      } else {
        this.animationFrameId = requestAnimationFrame(() =>
          this.gameLoop()
        );
      }
    },

    handleRaceFinish() {
      this.isRaceRunning = false;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      const currentRace = this.schedule[this.currentRaceIndex];

      // Gerçek finish sırası
      const finishedOrder = [...currentRace.horses].sort(
        (a, b) =>
          (a.finishTime || Infinity) -
          (b.finishTime || Infinity)
      );

      this.results.push(finishedOrder);

      this.currentRaceIndex++;
    }
  }
});
