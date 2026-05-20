<template>
  <div class="app-container">
    <header class="game-header">
      <h1>HORSE RACING TURBO</h1>

      <div class="controls">
        <button @click="store.generateHorsePool">
          YENİ TURNUVA OLUŞTUR
        </button>

        <button
          @click="store.startRace"
          :disabled="store.isRaceRunning"
        >
          BAŞLAT / DEVAM ET
        </button>

        <button
          @click="store.pauseRace"
          :disabled="!store.isRaceRunning"
        >
          DURAKLAT
        </button>
      </div>
    </header>

    <main class="game-layout">

      <!-- HORSE POOL -->
      <section class="panel horse-pool-panel">
        <h3>At Havuzu</h3>

        <div class="scroll-list" v-if="store.horsePool.length">
          <div
            v-for="horse in store.horsePool"
            :key="horse.id"
            class="horse-card"
          >
            <span class="horse-id-badge">#{{ horse.id }}</span>

            <span
              class="color-badge"
              :style="{ backgroundColor: horse.color }"
            ></span>

            <span class="horse-name">{{ horse.name }}</span>

            <span class="horse-condition">
              Kondisyon: {{ horse.condition }}
            </span>
          </div>
        </div>
      </section>

      <!-- TRACK -->
      <section class="panel track-panel">
        <div
          class="track-header"
          v-if="store.schedule[store.currentRaceIndex]"
        >
          <h3>{{ store.currentRaceIndex + 1 }}. Yarış</h3>

          <span class="distance-tag">
            {{ store.schedule[store.currentRaceIndex].distance }}m
          </span>
        </div>

        <div class="track-header" v-else>
          <h3>Turnuva Tamamlandı</h3>
        </div>

        <div class="race-track" v-if="store.activeRaceHorses.length">

          <div
            v-for="(horse, index) in store.activeRaceHorses"
            :key="horse.id"
            class="lane"
          >
            <div class="lane-number">
              Kulvar {{ index + 1 }}
            </div>

            <div class="track-line">
              <div
                class="horse-avatar"
                :style="{
                  left: horse.position + '%',
                  backgroundColor: horse.color
                }"
              >
                #{{ horse.id }} 🐎
              </div>
            </div>
          </div>

          <div class="finish-line">FINISH</div>
        </div>

        <div v-else>
          Turnuva oluşturun
        </div>
      </section>

      <!-- SIDEBAR -->
      <section class="panel sidebar-panel">

        <div class="program-section">
          <h3>Yarış Programı</h3>

          <div class="program-list">
            <div
              v-for="(race, index) in store.schedule"
              :key="index"
              class="program-item"
              :class="{
                active: index === store.currentRaceIndex,
                done: index < store.currentRaceIndex
              }"
            >
              <span>{{ index + 1 }}. {{ race.distance }}m</span>

              <span v-if="index === store.currentRaceIndex">
                Koşuyor
              </span>

              <span v-else-if="index < store.currentRaceIndex">
                Bitti
              </span>
            </div>
          </div>
        </div>

        <!-- 🔥 FIX: SCROLL BURADA -->
        <div class="results-section">
          <h3>Sonuçlar</h3>

          <div class="results-scroll">
            <div
              v-for="(raceResult, i) in store.results"
              :key="i"
              class="result-block"
            >
              <h4>{{ store.raceProgram[i] }}m</h4>

              <ol>
                <li
                  v-for="horse in raceResult.slice(0, 3)"
                  :key="horse.id"
                >
                  #{{ horse.id }} {{ horse.name }}
                </li>
              </ol>
            </div>

            <p v-if="!store.results.length">
              Henüz sonuç yok
            </p>
          </div>
        </div>

      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from './store/gameStore'

const store = useGameStore()

onMounted(() => {
  store.generateHorsePool()
})
</script>

<style scoped>
.app-container {
  font-family: Arial;
  padding: 20px;
  background: #f5f6fa;
  min-height: 100vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  color: white;
  padding: 15px;
  border-radius: 10px;
}

.controls button {
  margin-left: 10px;
  padding: 8px 12px;
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.panel {
  background: white;
  padding: 15px;
  border-radius: 10px;
  height: 80vh;
  overflow: hidden;
}

.scroll-list {
  overflow-y: auto;
  height: 100%;
}

/* TRACK */
.race-track {
  position: relative;
  height: 100%;
}

.lane {
  height: 45px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #ddd;
}

.lane-number {
  width: 80px;
}

.track-line {
  position: relative;
  flex: 1;
  background: #eef2f7;
}

.horse-avatar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
}

/* FINISH */
.finish-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: red;
  writing-mode: vertical-rl;
  text-align: center;
}

/* 🔥 FIX: RESULTS SCROLL */
.results-section {
  display: flex;
  flex-direction: column;
  height: 50%;
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.result-block {
  margin-bottom: 10px;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
}
</style>
