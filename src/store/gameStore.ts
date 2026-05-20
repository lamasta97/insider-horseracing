import { defineStore } from 'pinia';

export interface Horse {
  id: number;
  name: string;
  condition: number;
  color: string;
  position: number; 
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
    schedule: [] as RaceSchedule[], // 6 yarışın önceden hazırlanan programı
    results: [] as Array<Horse[]>,  
    animationFrameId: null as number | null,
  }),

  getters: {
    // O an koşan yarışı döndürür
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
        'Bold Pilot', 'Asilhan', 'Rüzgar', 'Şahbatur', 'Gülbatur',
        'Storm', 'Thunder', 'Black Beauty', 'Pegasus', 'Eclipse',
        'Gazi', 'Yıldırım', 'Poyraz', 'Dolunay', 'Gece',
        'Ateş', 'Savaşçı', 'Efsane', 'Asil', 'Rüzgar Gülü'
      ];

      this.horsePool = Array.from({ length: 20 }, (_, i) => {
        const hue = (i * 18) % 360; 
        return {
          id: i + 1,
          name: names[i] || `Horse ${i + 1}`,
          condition: Math.floor(Math.random() * 100) + 1,
          color: `hsl(${hue}, 70%, 50%)`,
          position: 0,
        };
      });

      this.generateProgram();
    },

    // 6 Yarışın hepsini birden önceden oluşturuyoruz (Locked Spec)
    generateProgram() {
      this.results = [];
      this.currentRaceIndex = 0;
      this.isRaceRunning = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      
      this.schedule = this.raceProgram.map((distance) => {
        // Her yarış için 20 attan rastgele 10 tanesini seç
        const shuffled = [...this.horsePool].sort(() => 0.5 - Math.random());
        const selectedHorses = shuffled.slice(0, 10).map(horse => ({
          ...horse,
          position: 0 // Yarışın başlangıç konumu
        }));
        return {
          distance,
          horses: selectedHorses
        };
      });
    },

    startRace() {
      if (this.isRaceRunning || this.currentRaceIndex >= this.schedule.length) return;
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

      let raceFinished = false;
      const currentRace = this.schedule[this.currentRaceIndex];
      const currentDistance = currentRace.distance;

      currentRace.horses.forEach((horse) => {
        if (horse.position >= 100) return;

        // Gelişmiş Koşu Formülü
        const baseSpeed = 0.15;
        const conditionFactor = (horse.condition / 100) * 0.12;
        const rngFactor = Math.random() * 0.22;
        const distanceModifier = currentDistance / 2000; 

        const tickProgress = baseSpeed + (conditionFactor * distanceModifier) + rngFactor;
        horse.position = Math.min(100, horse.position + tickProgress);

        if (horse.position >= 100) {
          // Tüm atların yarışı bitirip bitirmediğini kontrol et
          raceFinished = currentRace.horses.every(h => h.position >= 100);
        }
      });

      if (raceFinished) {
        this.handleRaceFinish();
      } else {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },

    handleRaceFinish() {
      this.isRaceRunning = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

      const currentRace = this.schedule[this.currentRaceIndex];
      // Atları varış derecesine (pozisyonuna) göre sırala
      const finishedOrder = [...currentRace.horses].sort((a, b) => b.position - a.position);
      
      this.results.push(finishedOrder);
      this.currentRaceIndex++;
    }
  }
});