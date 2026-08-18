import {
  ActionIcon,
  Box,
  Center,
  Group,
  Menu,
  Slider,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TbHeadphones,
  TbMusic,
  TbPlayerPause,
  TbPlayerPlay,
  TbPlayerTrackNext,
  TbPlayerTrackPrev,
  TbRepeat,
  TbRepeatOnce,
  TbVolume,
  TbVolume2,
  TbVolume3,
  TbVolumeOff,
} from "react-icons/tb";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import { Badge } from "../common/Badge";

export interface AudioPlayerProps {
  src: string;
  fileName: string;
  fileSize?: number;
  autoPlay?: boolean;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hours > 0) {
    return `${hours}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  fileName,
  fileSize,
  autoPlay = false,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(0);
  const [hoverSeekPercent, setHoverSeekPercent] = useState(0);

  const extension = fileName.split(".").pop()?.toUpperCase() || "AUDIO";

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);

    if (audioRef.current.buffered.length > 0) {
      const end = audioRef.current.buffered.end(
        audioRef.current.buffered.length - 1
      );
      if (audioRef.current.duration > 0) {
        setBuffered((end / audioRef.current.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const seekTrackRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);

  const calculateSeekPos = useCallback((clientX: number) => {
    if (!seekTrackRef.current || duration === 0) return 0;
    const rect = seekTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pos;
  }, [duration]);

  const applySeek = useCallback((pos: number) => {
    if (!audioRef.current || duration === 0) return;
    const target = pos * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  }, [duration]);

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isScrubbingRef.current = true;
    const pos = calculateSeekPos(e.clientX);
    applySeek(pos);
  };

  const handleSeekTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isScrubbingRef.current = true;
    if (e.touches[0]) {
      const pos = calculateSeekPos(e.touches[0].clientX);
      applySeek(pos);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isScrubbingRef.current) return;
      const pos = calculateSeekPos(e.clientX);
      applySeek(pos);
      setHoverSeekPercent(pos * 100);
      setHoverSeekTime(pos * duration);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isScrubbingRef.current || !e.touches[0]) return;
      const pos = calculateSeekPos(e.touches[0].clientX);
      applySeek(pos);
      setHoverSeekPercent(pos * 100);
      setHoverSeekTime(pos * duration);
    };

    const handleGlobalMouseUp = () => {
      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("touchmove", handleGlobalTouchMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [calculateSeekPos, applySeek, duration]);

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = calculateSeekPos(e.clientX);
    setHoverSeekPercent(pos * 100);
    setHoverSeekTime(pos * duration);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        audioRef.current.volume = 0.5;
      }
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (val: number) => {
    const norm = val / 100;
    setVolume(norm);
    if (!audioRef.current) return;
    audioRef.current.volume = norm;
    if (norm === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleLoop = () => {
    if (!audioRef.current) return;
    const next = !isLooping;
    setIsLooping(next);
    audioRef.current.loop = next;
  };

  const skipSeconds = (secs: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + secs)
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        skipSeconds(-5);
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        skipSeconds(5);
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "r") {
        e.preventDefault();
        toggleLoop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, duration, isMuted, isLooping]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <TbVolumeOff size={18} />;
    if (volume < 0.3) return <TbVolume3 size={18} />;
    if (volume < 0.7) return <TbVolume2 size={18} />;
    return <TbVolume size={18} />;
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 580,
        backgroundColor: isDark
          ? "var(--surface-1, #151B24)"
          : "var(--surface-0, #FFFFFF)",
        borderRadius: "var(--radius-lg, 16px)",
        border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.12))",
        boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0, 0, 0, 0.25))",
        padding: "24px 20px 20px 20px",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => !isLooping && setIsPlaying(false)}
      />

      {/* Top Section: Disc Art + Title */}
      <Group spacing={16} align="center" noWrap mb={20}>
        {/* Vinyl Disc with Rotating Glow */}
        <Box
          onClick={togglePlay}
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            backgroundColor: "var(--brand-primary-subtle, rgba(37, 99, 235, 0.15))",
            border: "2px solid var(--brand-primary, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brand-primary, #3B82F6)",
            cursor: "pointer",
            flexShrink: 0,
            position: "relative",
            boxShadow: isPlaying
              ? "0 0 20px var(--brand-primary-subtle, rgba(37, 99, 235, 0.4))"
              : "none",
            animation: isPlaying ? "spin 6s linear infinite" : "none",
            "@keyframes spin": {
              "100%": {
                transform: "rotate(360deg)",
              },
            },
          }}
        >
          <TbHeadphones size={32} />
        </Box>

        {/* Track Title & Metadata Info */}
        <Stack spacing={4} sx={{ minWidth: 0, flex: 1 }}>
          <Group spacing={8} noWrap align="center">
            <Text
              size="md"
              weight={700}
              truncate
              title={fileName}
              sx={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                letterSpacing: "-0.01em",
              }}
            >
              {fileName}
            </Text>
            <Badge variant="warning" size="xs">
              {extension}
            </Badge>
          </Group>

          <Group spacing={8} align="center" noWrap>
            {fileSize ? (
              <Text size="xs" color="dimmed" className="font-mono">
                {byteToHumanSizeString(fileSize)}
              </Text>
            ) : null}
            <Text size="xs" color="dimmed">•</Text>
            <Text size="xs" color="dimmed" className="font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Group>
        </Stack>

        {/* Dynamic Animated Frequency Visualizer Bars */}
        <Group spacing={3} align="flex-end" sx={{ height: 28 }}>
          {[12, 22, 16, 26, 18, 14, 24].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: isPlaying ? h : 4,
                backgroundColor: "var(--brand-primary, #3B82F6)",
                borderRadius: 2,
                transition: "height 200ms ease",
                opacity: isPlaying ? 0.85 : 0.25,
                animation: isPlaying
                  ? `pulseBar 0.8s ease-in-out ${i * 0.1}s infinite alternate`
                  : "none",
                "@keyframes pulseBar": {
                  "0%": { height: 4 },
                  "100%": { height: h },
                },
              }}
            />
          ))}
        </Group>
      </Group>

      {/* Progress / Seek Bar with Hover Tooltip & Drag Support */}
      <Box
        ref={seekTrackRef}
        onMouseEnter={() => setIsHoveringSeek(true)}
        onMouseLeave={() => setIsHoveringSeek(false)}
        onMouseMove={handleSeekMouseMove}
        onMouseDown={handleSeekMouseDown}
        onTouchStart={handleSeekTouchStart}
        sx={{
          position: "relative",
          width: "100%",
          height: 18,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        {/* Track Background */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: isHoveringSeek ? 6 : 4,
            borderRadius: 3,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.08)",
            transition: "height 120ms ease",
            overflow: "hidden",
          }}
        >
          {/* Buffered Progress */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${buffered}%`,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.18)"
                : "rgba(0, 0, 0, 0.12)",
            }}
          />
          {/* Played Progress */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              backgroundColor: "var(--brand-primary, #3B82F6)",
            }}
          />
        </Box>

        {/* Thumb */}
        <Box
          sx={{
            position: "absolute",
            left: `${progressPercent}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: isHoveringSeek ? 14 : 10,
            height: isHoveringSeek ? 14 : 10,
            borderRadius: "50%",
            backgroundColor: "var(--brand-primary, #3B82F6)",
            border: "2px solid #FFFFFF",
            boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            transition: "width 120ms ease, height 120ms ease",
          }}
        />

        {/* Hover Time Tooltip */}
        {isHoveringSeek && duration > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: `${hoverSeekPercent}%`,
              bottom: 20,
              transform: "translateX(-50%)",
              backgroundColor: isDark
                ? "rgba(15, 23, 42, 0.95)"
                : "rgba(30, 41, 59, 0.9)",
              backdropFilter: "blur(6px)",
              color: "#FFFFFF",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontFamily: "monospace",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {formatTime(hoverSeekTime)}
          </Box>
        )}
      </Box>

      {/* Control Buttons Row */}
      <Group position="apart" align="center" noWrap>
        {/* Left: Volume Slider */}
        <Group spacing={4} noWrap align="center" sx={{ width: 140 }}>
          <Tooltip label={isMuted ? "Unmute (m)" : "Mute (m)"} withArrow>
            <ActionIcon
              variant="subtle"
              onClick={toggleMute}
              size="md"
              sx={{
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                "&:hover": {
                  color: "var(--brand-primary, #3B82F6)",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              }}
            >
              {renderVolumeIcon()}
            </ActionIcon>
          </Tooltip>

          <Box sx={{ width: 70 }}>
            <Slider
              size="xs"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              styles={{
                track: {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",
                },
                bar: { backgroundColor: "var(--brand-primary, #3B82F6)" },
                thumb: {
                  borderColor: "var(--brand-primary, #3B82F6)",
                  backgroundColor: "#FFFFFF",
                },
              }}
            />
          </Box>
        </Group>

        {/* Center: Skip Back, Main Play/Pause Button, Skip Forward */}
        <Group spacing={8} align="center" noWrap>
          <Tooltip label="Back 10s (j/Left)" withArrow>
            <ActionIcon
              variant="subtle"
              size="md"
              onClick={() => skipSeconds(-10)}
              sx={{
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                "&:hover": {
                  color: "var(--brand-primary, #3B82F6)",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              }}
            >
              <TbPlayerTrackPrev size={18} />
            </ActionIcon>
          </Tooltip>

          {/* Primary Circular Play/Pause Button */}
          <Box
            onClick={togglePlay}
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              backgroundColor: "var(--brand-primary, #3B82F6)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow:
                "0 4px 14px var(--brand-primary-subtle, rgba(37, 99, 235, 0.4))",
              transition: "transform 150ms ease, filter 150ms ease",
              "&:hover": {
                transform: "scale(1.08)",
                filter: "brightness(1.1)",
              },
            }}
          >
            {isPlaying ? (
              <TbPlayerPause size={22} />
            ) : (
              <TbPlayerPlay size={22} style={{ marginLeft: 2 }} />
            )}
          </Box>

          <Tooltip label="Forward 10s (l/Right)" withArrow>
            <ActionIcon
              variant="subtle"
              size="md"
              onClick={() => skipSeconds(10)}
              sx={{
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                "&:hover": {
                  color: "var(--brand-primary, #3B82F6)",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              }}
            >
              <TbPlayerTrackNext size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Right: Repeat Toggle & Speed Menu */}
        <Group spacing={6} noWrap align="center" sx={{ width: 140, justifyContent: "flex-end" }}>
          {/* Loop / Repeat Toggle */}
          <Tooltip label={isLooping ? "Repeat On (r)" : "Repeat Off (r)"} withArrow>
            <ActionIcon
              variant="subtle"
              size="md"
              onClick={toggleLoop}
              sx={{
                color: isLooping
                  ? "var(--brand-primary, #3B82F6)"
                  : isDark
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(0,0,0,0.5)",
                backgroundColor: isLooping
                  ? "var(--brand-primary-subtle, rgba(37, 99, 235, 0.12))"
                  : "transparent",
                "&:hover": {
                  color: "var(--brand-primary, #3B82F6)",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              }}
            >
              {isLooping ? <TbRepeatOnce size={18} /> : <TbRepeat size={18} />}
            </ActionIcon>
          </Tooltip>

          {/* Speed Selector */}
          <Menu shadow="md" width={110} position="top-end">
            <Menu.Target>
              <Tooltip label="Playback Speed" withArrow>
                <ActionIcon
                  variant="subtle"
                  size="md"
                  sx={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: isDark
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.7)",
                    "&:hover": {
                      color: "var(--brand-primary, #3B82F6)",
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {playbackRate}x
                </ActionIcon>
              </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Speed</Menu.Label>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Menu.Item
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  sx={{
                    fontWeight: playbackRate === rate ? 700 : 400,
                    color:
                      playbackRate === rate
                        ? "var(--brand-primary, #3B82F6)"
                        : undefined,
                  }}
                >
                  {rate}x {rate === 1 && "(Normal)"}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
};

export default AudioPlayer;
