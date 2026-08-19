import {
  ActionIcon,
  Box,
  Center,
  Group,
  Menu,
  Slider,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TbArrowsMaximize,
  TbArrowsMinimize,
  TbMaximize,
  TbPictureInPicture,
  TbPlayerPause,
  TbPlayerPlay,
  TbRotateClockwise,
  TbVolume,
  TbVolume2,
  TbVolume3,
  TbVolumeOff,
} from "react-icons/tb";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  fileName?: string;
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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  fileName,
  autoPlay = false,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(0);
  const [hoverSeekPercent, setHoverSeekPercent] = useState(0);
  const [isPipSupported, setIsPipSupported] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsPipSupported(
        Boolean(
          document.pictureInPictureEnabled &&
          videoRef.current?.requestPictureInPicture,
        ),
      );
    }
  }, []);

  const handleActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    handleActivity();
  }, [handleActivity]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Buffer percentage
    if (videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1,
      );
      if (videoRef.current.duration > 0) {
        setBuffered((end / videoRef.current.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const seekTrackRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);

  const calculateSeekPos = useCallback(
    (clientX: number) => {
      if (!seekTrackRef.current || duration === 0) return 0;
      const rect = seekTrackRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pos;
    },
    [duration],
  );

  const applySeek = useCallback(
    (pos: number) => {
      if (!videoRef.current || duration === 0) return;
      const target = pos * duration;
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    },
    [duration],
  );

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isScrubbingRef.current = true;
    const pos = calculateSeekPos(e.clientX);
    applySeek(pos);
    handleActivity();
  };

  const handleSeekTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isScrubbingRef.current = true;
    if (e.touches[0]) {
      const pos = calculateSeekPos(e.touches[0].clientX);
      applySeek(pos);
    }
    handleActivity();
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
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (val: number) => {
    const norm = val / 100;
    setVolume(norm);
    if (!videoRef.current) return;
    videoRef.current.volume = norm;
    if (norm === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // ignore
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 5,
          );
        }
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            duration,
            videoRef.current.currentTime + 5,
          );
        }
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, duration, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <TbVolumeOff size={18} />;
    if (volume < 0.3) return <TbVolume3 size={18} />;
    if (volume < 0.7) return <TbVolume2 size={18} />;
    return <TbVolume size={18} />;
  };

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleActivity}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 860,
        backgroundColor: "#000000",
        borderRadius: isFullscreen ? 0 : "var(--radius-lg, 12px)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.4))",
        border: isFullscreen
          ? "none"
          : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
        userSelect: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay={autoPlay}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{
          width: "100%",
          maxHeight: isFullscreen ? "100vh" : "calc(70vh - 80px)",
          display: "block",
          objectFit: "contain",
          cursor: "pointer",
          backgroundColor: "#000000",
        }}
      />

      {/* Center Big Play Button when paused */}
      {!isPlaying && (
        <Center
          onClick={togglePlay}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 48,
            cursor: "pointer",
            zIndex: 4,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "var(--brand-primary, #3B82F6)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow:
                "0 8px 30px var(--brand-primary-subtle, rgba(37, 99, 235, 0.45)), 0 2px 10px rgba(0, 0, 0, 0.3)",
              transition: "transform 150ms ease, filter 150ms ease",
              "&:hover": {
                transform: "scale(1.1)",
                filter: "brightness(1.15)",
              },
            }}
          >
            <TbPlayerPlay size={30} style={{ marginLeft: 3 }} />
          </Box>
        </Center>
      )}

      {/* Modern Control Bar Overlay */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)",
          padding: "16px 14px 10px 14px",
          opacity: showControls || !isPlaying ? 1 : 0,
          pointerEvents: showControls || !isPlaying ? "auto" : "none",
          transition: "opacity 200ms ease",
        }}
      >
        {/* Custom Seek Bar with Hover Tooltip & Drag Support */}
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
            marginBottom: 4,
          }}
        >
          {/* Seek Track Background */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: isHoveringSeek ? 6 : 4,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              transition: "height 120ms ease",
              overflow: "hidden",
            }}
          >
            {/* Buffer Progress */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${buffered}%`,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
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

          {/* Scrubber Thumb */}
          <Box
            sx={{
              position: "absolute",
              left: `${progressPercent}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: isHoveringSeek ? 14 : 10,
              height: isHoveringSeek ? 14 : 10,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
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
                backgroundColor: "rgba(15, 23, 42, 0.9)",
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

        {/* Bottom Actions Row */}
        <Group position="apart" align="center" noWrap>
          {/* Left: Play/Pause, Volume, Time */}
          <Group spacing={8} noWrap align="center">
            <Tooltip
              label={isPlaying ? "Pause (k/space)" : "Play (k/space)"}
              withArrow
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={togglePlay}
                size="md"
                sx={{
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                }}
              >
                {isPlaying ? (
                  <TbPlayerPause size={18} />
                ) : (
                  <TbPlayerPlay size={18} />
                )}
              </ActionIcon>
            </Tooltip>

            {/* Volume Control */}
            <Group
              spacing={4}
              noWrap
              align="center"
              sx={{ position: "relative" }}
            >
              <Tooltip label={isMuted ? "Unmute (m)" : "Mute (m)"} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={toggleMute}
                  size="md"
                  sx={{
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  {renderVolumeIcon()}
                </ActionIcon>
              </Tooltip>

              <Box sx={{ width: 68 }}>
                <Slider
                  size="xs"
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  styles={{
                    track: { backgroundColor: "rgba(255,255,255,0.2)" },
                    bar: { backgroundColor: "var(--brand-primary, #3B82F6)" },
                    thumb: {
                      borderColor: "var(--brand-primary, #3B82F6)",
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                />
              </Box>
            </Group>

            {/* Time Stamp */}
            <Text
              size="xs"
              color="dimmed"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontFamily: "monospace",
                marginLeft: 4,
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Group>

          {/* Right: Speed, PiP, Fullscreen */}
          <Group spacing={6} noWrap align="center">
            {/* Speed Selector */}
            <Menu shadow="md" width={110} position="top-end">
              <Menu.Target>
                <Tooltip label="Playback Speed" withArrow>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    sx={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
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

            {/* Picture-in-Picture */}
            {isPipSupported && (
              <Tooltip label="Picture in Picture" withArrow>
                <ActionIcon
                  variant="subtle"
                  onClick={togglePiP}
                  size="md"
                  sx={{
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  <TbPictureInPicture size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Fullscreen */}
            <Tooltip
              label={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              withArrow
            >
              <ActionIcon
                variant="subtle"
                onClick={toggleFullscreen}
                size="md"
                sx={{
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                }}
              >
                {isFullscreen ? (
                  <TbArrowsMinimize size={18} />
                ) : (
                  <TbArrowsMaximize size={18} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
