<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, RepeatIcon, ShuffleIcon, VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from 'lucide-vue-next'

useHead({ title: '音乐播放器' })
definePageMeta({ headerText: '我的音乐列表' })

interface Song {
  id: number
  title: string
  artist: string
  duration: string
  cover: string
  url: string
}

const songs = ref<Song[]>([
  { id: 1, title: '小半', artist: '陈粒', duration: '04:15', cover: '/placeholder.svg?height=300&width=300', url: '/audio/song1.mp3' },
  { id: 2, title: '岁月神偷 (Live)', artist: '周笔畅', duration: '03:52', cover: '/placeholder.svg?height=300&width=300', url: '/audio/song2.mp3' },
  { id: 3, title: '不是因为寂寞才想你(DJ版)', artist: '雨宗林', duration: '04:30', cover: '/placeholder.svg?height=300&width=300', url: '/audio/song3.mp3' },
  { id: 4, title: '化身孤岛的鲸', artist: '周深', duration: '05:13', cover: '/placeholder.svg?height=300&width=300', url: '/audio/song4.mp3' },
  { id: 5, title: 'Look At Me Now', artist: 'Charlie Puth', duration: '03:23', cover: '/placeholder.svg?height=300&width=300', url: '/audio/song5.mp3' },
])

const currentlyPlayingIndex = ref(0)
const isPlaying = ref(false)
const progress = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isShuffled = ref(false)
const repeatMode = ref(0) // 0: no repeat, 1: repeat all, 2: repeat one

const currentSong = computed(() => songs.value[currentlyPlayingIndex.value])
const audioRef = ref<HTMLAudioElement | null>(null)

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const currentTime = ref('0:00')
const totalTime = ref('0:00')

watch(isPlaying, (newVal) => {
  if (audioRef.value) {
    newVal ? audioRef.value.play() : audioRef.value.pause()
  }
})

watch(currentSong, (newSong) => {
  if (audioRef.value) {
    audioRef.value.src = newSong.url
    if (isPlaying.value) {
      audioRef.value.play().catch(() => { isPlaying.value = false })
    }
  }
})

watch(volume, (newVolume) => {
  if (audioRef.value) {
    audioRef.value.volume = newVolume
    isMuted.value = newVolume === 0
  }
})

const updateProgress = () => {
  if (audioRef.value) {
    progress.value = (audioRef.value.currentTime / audioRef.value.duration) * 100
    currentTime.value = formatTime(audioRef.value.currentTime)
    totalTime.value = formatTime(audioRef.value.duration)
  }
}

const handleSongEnd = () => {
  if (repeatMode.value === 2) {
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.play()
    }
  } else {
    nextSong()
  }
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const nextSong = () => {
  if (isShuffled.value) {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * songs.value.length)
    } while (newIndex === currentlyPlayingIndex.value)
    currentlyPlayingIndex.value = newIndex
  } else {
    currentlyPlayingIndex.value = (currentlyPlayingIndex.value + 1) % songs.value.length
  }
  if (repeatMode.value === 1 && currentlyPlayingIndex.value === 0) {
    isPlaying.value = true
  }
}

const prevSong = () => {
  currentlyPlayingIndex.value = (currentlyPlayingIndex.value - 1 + songs.value.length) % songs.value.length
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  volume.value = isMuted.value ? 0 : 1
}

const toggleShuffle = () => {
  isShuffled.value = !isShuffled.value
}

const toggleRepeat = () => {
  repeatMode.value = (repeatMode.value + 1) % 3
}

const seekTo = (event: MouseEvent) => {
  if (audioRef.value) {
    const progressBar = event.currentTarget as HTMLElement
    const clickPosition = event.clientX - progressBar.getBoundingClientRect().left
    const percentage = clickPosition / progressBar.offsetWidth
    audioRef.value.currentTime = percentage * audioRef.value.duration
  }
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.addEventListener('timeupdate', updateProgress)
    audioRef.value.addEventListener('ended', handleSongEnd)
    audioRef.value.src = currentSong.value.url
  }
})
</script>

<template>
  <div class="music-player">
    <div class="song-list">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-item"
        :class="{ 'active': index === currentlyPlayingIndex }"
        @click="currentlyPlayingIndex = index; isPlaying = true"
      >
        <div class="song-number">{{ index + 1 }}</div>
        <div class="song-info">
          <div class="song-title">{{ song.title }}</div>
          <div class="song-artist">{{ song.artist }}</div>
        </div>
        <div class="song-duration">{{ song.duration }}</div>
      </div>
    </div>

    <div class="player-controls">
      <div class="current-song-info">
        <img :src="currentSong.cover" :alt="currentSong.title" class="cover-art">
        <div class="song-details">
          <h2 class="current-song-title">{{ currentSong.title }}</h2>
          <p class="current-song-artist">{{ currentSong.artist }}</p>
        </div>
      </div>

      <div class="progress-bar" @click="seekTo">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>

      <div class="time-info">
        <span>{{ currentTime }}</span>
        <span>{{ totalTime }}</span>
      </div>

      <div class="playback-controls">
        <button @click="toggleShuffle" :class="{ 'active': isShuffled }" aria-label="随机播放">
          <ShuffleIcon />
        </button>
        <button @click="prevSong" aria-label="上一首">
          <SkipBackIcon />
        </button>
        <button @click="togglePlay" class="play-pause-btn" aria-label="播放/暂停">
          <PlayIcon v-if="!isPlaying" />
          <PauseIcon v-else />
        </button>
        <button @click="nextSong" aria-label="下一首">
          <SkipForwardIcon />
        </button>
        <button @click="toggleRepeat" :class="{ 'active': repeatMode > 0 }" aria-label="循环播放">
          <RepeatIcon />
          <span v-if="repeatMode === 2" class="repeat-one">1</span>
        </button>
      </div>

      <div class="volume-control">
        <button @click="toggleMute" aria-label="静音">
          <VolumeXIcon v-if="isMuted" />
          <VolumeIcon v-else-if="volume < 0.3" />
          <Volume1Icon v-else-if="volume < 0.7" />
          <Volume2Icon v-else />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model="volume"
          class="volume-slider"
        >
      </div>

      <audio ref="audioRef"></audio>
    </div>
  </div>
</template>

<style scoped lang="scss">
.music-player {
  display: flex;
  color: var(--c-text);
  height: 100vh;
}

.song-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--c-brand);
    border-radius: 4px;
  }
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    background-color: var(--c-bg-soft);
  }

  &.active {
    background-color: var(--c-bg-soft);
  }
}

.song-number {
  width: 30px;
  text-align: center;
  font-weight: bold;
}

.song-info {
  flex: 1;
  margin-left: 15px;
}

.song-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.song-artist {
  font-size: 0.9em;
  color: var(--c-text-light);
}

.song-duration {
  font-size: 0.9em;
  color: var(--c-text-light);
}

.player-controls {
  width: 350px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 1px solid var(--c-border);
}

.current-song-info {
  text-align: center;
  margin-bottom: 20px;
}

.cover-art {
  width: 250px;
  height: 250px;
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.current-song-title {
  font-size: 1.4em;
  margin-bottom: 5px;
  font-weight: bold;
}

.current-song-artist {
  font-size: 1.1em;
  color: var(--c-text-light);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--c-bg-mute);
  margin: 20px 0;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
}

.progress {
  height: 100%;
  background-color: var(--c-brand);
  transition: width 0.1s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: var(--c-text-light);
  margin-bottom: 20px;
}

.playback-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  button {
    background: none;
    border: none;
    color: var(--c-text);
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: var(--c-brand);
      transform: scale(1.1);
    }

    &.active {
      color: var(--c-brand);
    }
  }

  .play-pause-btn {
    font-size: 48px;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: var(--c-brand);
    color: var(--c-bg-mute);
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 20px var(--c-brand);
    }
  }
}

.volume-control {
  display: flex;
  align-items: center;

  button {
    background: none;
    border: none;
    color: var(--c-text);
    font-size: 24px;
    cursor: pointer;
    margin-right: 10px;
    transition: color 0.3s ease;

    &:hover {
      color: var(--c-brand);
    }
  }

  .volume-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--c-bg-mute);
    outline: none;
    transition: opacity 0.2s;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: var(--c-brand);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.2);
      }
    }

    &::-moz-range-thumb {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: var(--c-brand);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
}

.repeat-one {
  position: absolute;
  font-size: 12px;
  
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>