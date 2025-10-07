import { useState, useRef, useEffect } from "react";

const AudioControls = ({
  audioUrl,
  isPlaying,
  onPlayPause,
  onVolumeChange,
  onSpeedChange,
}) => {
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  const handlePlayPause = () => {
    if (!audioUrl) {
      alert("No audio available for this exercise");
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPaused(true);
    } else {
      audioRef.current?.play();
      setIsPaused(false);
    }
    onPlayPause();
  };

  const getPlayButtonIcon = () => {
    return isPlaying ? "⏸" : "▶";
  };

  const getPlayButtonText = () => {
    return isPlaying ? "Pause Sentence" : "Play Sentence";
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);

    // Update slider fill
    const percent = newVolume * 100;
    e.target.style.background = `linear-gradient(to right, #5fa69c 0%, #5fa69c ${percent}%, #d1d5db ${percent}%, #d1d5db 100%)`;
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackRate(newSpeed);
    onSpeedChange?.(newSpeed);

    // Update slider fill
    const percent = ((newSpeed - 0.5) / (2 - 0.5)) * 100;
    e.target.style.background = `linear-gradient(to right, #5fa69c 0%, #5fa69c ${percent}%, #d1d5db ${percent}%, #d1d5db 100%)`;
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 py-6 sm:py-10 px-4 sm:px-[60px] bg-[#f8fafc] rounded-[16px] sm:rounded-[20px] max-w-[900px] mx-auto shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPaused(false);
            onPlayPause();
          }}
          onError={() => {
            console.error("Audio failed to load");
            alert(
              "Failed to load audio. Please check your internet connection."
            );
          }}
        />
      )}

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 min-h-8">
        <div className="text-lg sm:text-[22px] w-6 sm:w-7 flex items-center justify-center flex-shrink-0">
          🔊
        </div>
        <div className="font-normal text-[#374151] text-xs sm:text-[15px] min-w-fit whitespace-nowrap">
          Volume:
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-[6px] min-h-[6px] max-h-[6px] min-w-auto border-none rounded-[10px] outline-none appearance-none cursor-pointer max-w-[200px] relative p-0 m-0 box-border align-middle"
          style={{
            background: `linear-gradient(to right, #5fa69c 0%, #5fa69c ${
              volume * 100
            }%, #d1d5db ${volume * 100}%, #d1d5db 100%)`,
          }}
        />
        <div className="font-normal text-[#374151] text-xs sm:text-[15px] min-w-[40px] sm:min-w-[50px] text-left">
          {Math.round(volume * 100)}%
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 min-h-8">
        <div className="text-lg sm:text-[22px] w-6 sm:w-7 flex items-center justify-center flex-shrink-0">
          ⚡
        </div>
        <div className="font-normal text-[#374151] text-xs sm:text-[15px] min-w-fit whitespace-nowrap">
          Speed:
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={playbackRate}
          onChange={handleSpeedChange}
          className="flex-1 h-[6px] min-h-[6px] max-h-[6px] min-w-auto border-none rounded-[10px] outline-none appearance-none cursor-pointer max-w-[200px] relative p-0 m-0 box-border align-middle"
          style={{
            background: `linear-gradient(to right, #5fa69c 0%, #5fa69c ${
              ((playbackRate - 0.5) / (2 - 0.5)) * 100
            }%, #d1d5db ${
              ((playbackRate - 0.5) / (2 - 0.5)) * 100
            }%, #d1d5db 100%)`,
          }}
        />
        <div className="font-normal text-[#374151] text-xs sm:text-[15px] min-w-[40px] sm:min-w-[50px] text-left">
          {playbackRate.toFixed(1)}x
        </div>
      </div>

      {/* Listen to the sentence */}
      <div className="flex items-center gap-2 sm:gap-[10px] mt-4 mb-2 justify-center">
        <div className="text-xl sm:text-[26px]">🔊</div>
        <div className="text-sm sm:text-[18px] font-semibold text-[#374151]">
          Listen to the sentence:
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={handlePlayPause}
        disabled={!audioUrl}
        className={`flex items-center justify-center gap-2 sm:gap-[10px] bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white border-none px-6 sm:px-9 py-3 sm:py-[14px] rounded-[40px] sm:rounded-[50px] text-sm sm:text-base font-medium cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(95,166,156,0.25)] min-h-[44px] sm:min-h-[52px] mx-auto max-w-fit ${
          !audioUrl
            ? "bg-[#9ca3af] cursor-not-allowed opacity-60"
            : "hover:bg-[linear-gradient(45deg,#275151,#63a29b)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(95,166,156,0.35)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(95,166,156,0.25)]"
        }`}
      >
        <span className="text-base sm:text-[18px] flex items-center">
          {getPlayButtonIcon()}
        </span>
        <span className="text-sm sm:text-base">{getPlayButtonText()}</span>
      </button>
    </div>
  );
};

export default AudioControls;
