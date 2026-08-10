import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, Play, Pause, X } from 'lucide-react';

// ========== БЕСПЛАТНЫЕ ТРЕКИ ИЗ ИНТЕРНЕТА ==========
const TRACKS = [
  { 
    id: 'electronic', 
    name: '✨ Electronic Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  { 
    id: 'lofi', 
    name: '🎵 Lo-Fi Chill',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  { 
    id: 'ambient', 
    name: '🌊 Ambient Dream',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  { 
    id: 'piano', 
    name: '🎹 Piano Relax',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  { 
    id: 'guitar', 
    name: '🎸 Acoustic Guitar',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
];

const MiniMusicPlayer = ({ autoPlay = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [volume, setVolume] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  // ========== ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА И АВТОПЛЕЙ ==========
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      setError(false);
      
      if (autoPlay && !hasStarted) {
        setHasStarted(true);
        audio.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Auto-play blocked:', err);
            setIsPlaying(false);
          });
      }
    };

    const handleError = (e) => {
      console.error('❌ Ошибка загрузки:', selectedTrack.url);
      setError(true);
      setIsLoaded(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [autoPlay, hasStarted, selectedTrack.url]);

  // ========== ПЕРЕКЛЮЧЕНИЕ ТРЕКА ==========
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoaded(false);
    setError(false);
    audio.load();

    const playNewTrack = () => {
      setIsLoaded(true);
      setError(false);

      if (isPlaying) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.log('❌ Track play error:', err);
            setIsPlaying(false);
          });
      }
    };

    audio.addEventListener('canplay', playNewTrack);

    return () => {
      audio.removeEventListener('canplay', playNewTrack);
    };
  }, [selectedTrack]);

  // ========== СЛЕДУЮЩИЙ ТРЕК ПОСЛЕ ОКОНЧАНИЯ ==========
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
      console.log(`🔄 Переключение: ${currentTrackIndex} -> ${nextIndex}`);
      setCurrentTrackIndex(nextIndex);
      setSelectedTrack(TRACKS[nextIndex]);
      setIsPlaying(true);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // ========== УПРАВЛЕНИЕ ВОСПРОИЗВЕДЕНИЕМ ==========
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;

    if (isPlaying && isLoaded) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Play error:', err);
          setIsPlaying(false);
        });
    } else if (!isPlaying) {
      audio.pause();
    }
  }, [isPlaying, volume, isLoaded]);

  // ========== СИНХРОНИЗАЦИЯ ИНДЕКСА ==========
  useEffect(() => {
    const index = TRACKS.findIndex(t => t.id === selectedTrack.id);
    if (index !== -1 && index !== currentTrackIndex) {
      setCurrentTrackIndex(index);
    }
  }, [selectedTrack]);

  // ========== ЗАКРЫТИЕ ПРИ КЛИКЕ ВНЕ ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && playerRef.current && !playerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (track, index) => {
    setSelectedTrack(track);
    setCurrentTrackIndex(index);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={playerRef}>
      <audio 
        ref={audioRef} 
        src={selectedTrack.url}
        preload="auto"
      />

      <div className={`bg-[#030712]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
        isExpanded ? 'p-4 w-72' : 'p-3'
      }`}>
        {isExpanded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={16} className={isPlaying ? 'text-[#f97316] animate-pulse' : 'text-white/40'} />
                <span className="text-sm font-medium text-white">Музыка</span>
                {error && (
                  <span className="text-xs text-yellow-500">⚠️ Ошибка</span>
                )}
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Выбор трека - с кастомным скроллом */}
            <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(249, 115, 22, 0.3) transparent'
            }}>
              {TRACKS.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => changeTrack(track, index)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTrack.id === track.id
                      ? 'bg-[#f97316] text-white'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>

            {/* Управление */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={error}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  error 
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-[#f97316] hover:bg-[#ea580c]'
                }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <Volume2 size={14} className="text-white/40" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-1 rounded-full bg-white/10 appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Статус и информация о треке */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/30">
                {isPlaying ? '▶ Играет' : '⏸ Пауза'}
                {isLoaded && !error && ' 🟢'}
                {error && ' 🔴 Ошибка'}
              </span>
              <span className="text-[10px] text-white/20">
                {currentTrackIndex + 1} / {TRACKS.length}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <Music size={18} className={isPlaying ? 'text-[#f97316] animate-pulse' : ''} />
            <span className="text-xs font-medium">
              {isPlaying ? ` ${selectedTrack.name}` : ' Включить музыку'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MiniMusicPlayer;