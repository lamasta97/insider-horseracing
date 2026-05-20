<template>
  <div class="app-container">
    <header class="game-header">
      <h1>HORSE RACING TURBO</h1>
      <div class="controls">
        <button @click="store.generateHorsePool">YENİ TURNUVA OLUŞTUR (GENERATE)</button>
        <button @click="store.startRace" :disabled="store.isRaceRunning || store.currentRaceIndex >= store.schedule.length">BAŞLAT / DEVAM ET</button>
        <button @click="store.pauseRace" :disabled="!store.isRaceRunning">DURAKLAT</button>
      </div>
    </header>

    <main class="game-layout">
      
      <section class="panel horse-pool-panel">
        <h3>At Havuzu (1-20)</h3>
        <div class="scroll-list" v-if="store.horsePool.length">
          <div v-for="horse in store.horsePool" :key="horse.id" class="horse-card">
            <span class="horse-id-badge">#{{ horse.id }}</span>
            <span class="color-badge" :style="{ backgroundColor: horse.color }"></span>
            <span class="horse-name">{{ horse.name }}</span>
            <span class="horse-condition">Kondisyon: {{ horse.condition }}</span>
          </div>
        </div>
      </section>

      <section class="panel track-panel">
        <div class="track-header" v-if="store.schedule[store.currentRaceIndex]">
          <h3>Aktif Yarış: {{ store.currentRaceIndex + 1 }}. Ayak</h3>
          <span class="distance-tag">{{ store.schedule[store.currentRaceIndex].distance }}m</span>
        </div>
        <div class="track-header" v-else>
          <h3>Turnuva Tamamlandı!</h3>
        </div>

        <div class="race-track" v-if="store.activeRaceHorses.length">
          <div v-for="(horse, index) in store.activeRaceHorses" :key="horse.id" class="lane">
            <div class="lane-number">Kkulvar {{ index + 1 }}</div>
            <div class="track-line">
              <div 
                class="horse-avatar" 
                :style="{ 
                  transform: `translateX(${horse.position * 4.5}px)`, 
                  backgroundColor: horse.color 
                }"
              >
                <span class="avatar-number">{{ horse.id }}</span> 🐎
              </div>
            </div>
          </div>
          <div class="finish-line">FINISH</div>
        </div>
        <div class="no-track" v-else>
          <p>Lütfen yukarıdan yeni turnuva oluşturun.</p>
        </div>
      </section>

      <section class="panel sidebar-panel">
        <div class="program-section">
          <h3>Yarış Programı</h3>
          <div class="program-list" v-if="store.schedule.length">
            <div 
              v-for="(race, index) in store.schedule" 
              :key="index" 
              class="program-item"
              :class="{ 'active-program': index === store.currentRaceIndex, 'passed-program': index < store.currentRaceIndex }"
            >
              <span>{{ index + 1 }}. Yarış - {{ race.distance }}m</span>
              <span v-if="index === store.currentRaceIndex" class="status-badge">Koşuluyor</span>
              <span v-if="index < store.currentRaceIndex" class="status-badge done">Bitti</span>
            </div>
          </div>
        </div>

        <div class="results-section">
          <h3>Sonuçlar Paneli</h3>
          <div v-if="store.results.length" class="results-scroll">
            <div v-for="(raceResult, rIndex) in store.results" :key="rIndex" class="result-block">
              <h4>{{ store.raceProgram[rIndex] }}m Sonucu</h4>
              <ol>
                <li v-for="(horse, hIndex) in raceResult.slice(0, 3)" :key="horse.id">
                  <strong>#{{ horse.id }}</strong> {{ horse.name }}
                </li>
              </ol>
            </div>
          </div>
          <p class="empty-text" v-else>Henüz tamamlanan yarış yok.</p>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './store/gameStore';

const store = useGameStore();

onMounted(() => {
  store.generateHorsePool();
});
</script>

<style scoped>
.app-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f0f2f5; min-height: 95vh; }
.game-header { display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; color: #fff; padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.game-header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
.controls button { margin-left: 10px; padding: 10px 18px; cursor: pointer; font-weight: bold; border-radius: 4px; border: none; background: #3498db; color: white; transition: background 0.2s; }
.controls button:disabled { background: #95a5a6; cursor: not-allowed; }
.controls button:hover:not(:disabled) { background: #2980b9; }
.game-layout { display: grid; grid-template-columns: 1fr 2fr 1.2fr; gap: 20px; }
.panel { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); height: 78vh; display: flex; flex-direction: column; }
.panel h3 { margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; color: #2c3e50; }
.scroll-list { flex-grow: 1; overflow-y: auto; }
.horse-card { display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.horse-id-badge { background: #e1e4e8; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px; }
.color-badge { width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ccc; flex-shrink: 0; }
.horse-name { flex-grow: 1; font-weight: 500; }
.track-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.distance-tag { background: #e67e22; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold; }
.race-track { position: relative; border: 2px solid #bdc3c7; background: #dfe4ea; padding: 10px 0; border-radius: 6px; flex-grow: 1; overflow: hidden; }
.lane { display: flex; align-items: center; height: 42px; border-bottom: 1px dashed #fff; }
.lane-number { width: 70px; text-align: center; font-size: 11px; font-weight: bold; background: #718093; color: white; padding: 4px 0; border-radius: 0 4px 4px 0; }
.track-line { position: relative; flex-grow: 1; height: 100%; }
.horse-avatar { position: absolute; height: 32px; padding: 0 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); top: 5px; }
.avatar-number { font-size: 10px; background: rgba(0,0,0,0.4); padding: 1px 4px; border-radius: 3px; }
.finish-line { position: absolute; right: 60px; top: 0; bottom: 0; width: 12px; background: #c0392b; color: white; font-size: 9px; writing-mode: vertical-lr; text-align: center; font-weight: bold; letter-spacing: 2px; }
.sidebar-panel { gap: 20px; }
.program-section, .results-section { display: flex; flex-direction: column; height: 50%; }
.program-list { overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.program-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 4px; font-size: 13px; border-left: 3px solid #ccc; }
.active-program { border-left-color: #2ecc71; background: #e8f8f5; font-weight: bold; }
.passed-program { opacity: 0.6; text-decoration: line-through; }
.status-badge { font-size: 10px; padding: 2px 6px; background: #2ecc71; color: white; border-radius: 3px; }
.status-badge.done { background: #95a5a6; }
.results-scroll { overflow-y: auto; flex-grow: 1; }
.result-block { margin-bottom: 12px; background: #fcfcfc; padding: 10px; border: 1px solid #edf0f2; border-radius: 4px; }
.result-block h4 { margin: 0 0 6px 0; font-size: 13px; color: #34495e; }
.result-block ol { margin: 0; padding-left: 20px; font-size: 12px; }
.empty-text { font-size: 13px; color: #7f8c8d; text-align: center; margin: auto; }
.no-track { text-align: center; margin: auto; color: #7f8c8d; }
</style>