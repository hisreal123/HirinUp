import { useState, useRef, useCallback } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

let webClientInstance: RetellWebClient | null = null;

export const setWebClientInstance = (client: RetellWebClient) => {
  webClientInstance = client;
};

export type AudioCheckStatus = {
  microphonePermission: boolean;
  audioLevelDetected: boolean;
  deviceSelected: boolean;
  browserCompatible: boolean;
  networkQuality: "good" | "poor" | "unknown";
};

export const useAudioDetection = (
  isStarted: boolean,
  onAudioMessage?: (message: string) => void,
) => {
  const [audioNotDetected, setAudioNotDetected] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isTestingMic, setIsTestingMic] = useState(false);
  const audioMessage =
    "I can see you, but I'm not receiving any audio yet. Let's quickly check a few things together.";
  const [audioCheckStatus, setAudioCheckStatus] = useState<AudioCheckStatus>({
    microphonePermission: false,
    audioLevelDetected: false,
    deviceSelected: false,
    browserCompatible: true,
    networkQuality: "unknown",
  });

  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modalShownRef = useRef<boolean>(false); // Track if modal has been shown
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track timeout to prevent multiple calls

  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);

      return false;
    }
  }, []);

  const checkBrowserCompatibility = useCallback((): boolean => {
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia =
      hasMediaDevices && "getUserMedia" in navigator.mediaDevices;
    const hasAudioContext = !!(
      window.AudioContext || (window as any).webkitAudioContext
    );

    return hasMediaDevices && hasGetUserMedia && hasAudioContext;
  }, []);

  const getAvailableAudioDevices = useCallback(async (): Promise<
    MediaDeviceInfo[]
  > => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput",
      );
      setAvailableDevices(audioDevices);
      if (audioDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioDevices[0].deviceId);
      }

      return audioDevices;
    } catch (error) {
      console.error("Error enumerating devices:", error);

      return [];
    }
  }, [selectedDeviceId]);

  const checkNetworkQuality = useCallback(async (): Promise<
    "good" | "poor" | "unknown"
  > => {
    try {
      if (!webClientInstance) return "unknown";
      const connection = (webClientInstance as any).peerConnection;
      if (connection) {
        const stats = await connection.getStats();
        let hasAudioStats = false;
        stats.forEach((report: any) => {
          if (report.type === "inbound-rtp" && report.mediaType === "audio") {
            hasAudioStats = true;
            const packetLoss = report.packetsLost / report.packetsReceived;
            if (packetLoss > 0.1) {
              return "poor";
            }
          }
        });

        return hasAudioStats ? "good" : "unknown";
      }

      return "unknown";
    } catch (error) {
      console.error("Error checking network quality:", error);

      return "unknown";
    }
  }, []);

  const startAudioLevelDetection = useCallback(
    async (deviceId?: string) => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        audioStreamRef.current = stream;

        const audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let noAudioStartTime: number | null = null;
        const noAudioThresholdMs = 10000; // 10 seconds

        const checkAudioLevel = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = Math.min(100, (average / 128) * 100);
          setAudioLevel(normalizedLevel);
          const threshold = 5;

          if (average < threshold) {
            // Start tracking no-audio time if not already
            if (noAudioStartTime === null) {
              noAudioStartTime = Date.now();
            }

            const noAudioDuration = Date.now() - noAudioStartTime;

            if (noAudioDuration >= noAudioThresholdMs) {
              setAudioCheckStatus((prev) => ({
                ...prev,
                audioLevelDetected: false,
              }));
              // Always set audioNotDetected to true when audio is not detected for 10 seconds
              setAudioNotDetected(true);
              // Only show modal once per detection cycle
              if (!modalShownRef.current) {
                modalShownRef.current = true;
                if (onAudioMessage) {
                  onAudioMessage(audioMessage);
                }
                // Clear any existing timeout
                if (modalTimeoutRef.current) {
                  clearTimeout(modalTimeoutRef.current);
                }
                modalTimeoutRef.current = setTimeout(() => {
                  setShowAudioModal(true);
                }, 2000);
              }
            }
          } else {
            noAudioStartTime = null; // Reset when audio is detected
            setAudioCheckStatus((prev) => ({
              ...prev,
              audioLevelDetected: true,
            }));
            setAudioNotDetected((prevNotDetected) => {
              if (prevNotDetected) {
                // Clear timeout if audio is detected before modal shows
                if (modalTimeoutRef.current) {
                  clearTimeout(modalTimeoutRef.current);
                  modalTimeoutRef.current = null;
                }
                setShowAudioModal(false);
                modalShownRef.current = false; // Reset flag when audio is detected
                return false;
              }
              return prevNotDetected;
            });
          }

          animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      } catch (error) {
        console.error("Error starting audio detection:", error);
        setAudioCheckStatus((prev) => ({
          ...prev,
          audioLevelDetected: false,
        }));
      }
    },
    [onAudioMessage, audioMessage],
  );

  const stopAudioLevelDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }
    modalShownRef.current = false;
  }, []);

  const changeDevice = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      stopAudioLevelDetection();
      setAudioNotDetected(false);
      modalShownRef.current = false;
      await startAudioLevelDetection(deviceId);
    },
    [stopAudioLevelDetection, startAudioLevelDetection],
  );

  const testMicrophone = useCallback(async () => {
    setIsTestingMic(true);
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let maxLevel = 0;

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        maxLevel = Math.max(maxLevel, avg);
        setAudioLevel(Math.min(100, (avg / 128) * 100));
      };

      const interval = setInterval(checkLevel, 50);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(interval);
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();

      setIsTestingMic(false);
      return maxLevel > 5;
    } catch (error) {
      console.error("Error testing microphone:", error);
      setIsTestingMic(false);
      return false;
    }
  }, [selectedDeviceId]);

  const performAudioChecks = useCallback(async () => {
    // Reset modal state when checking again
    setShowAudioModal(false);
    modalShownRef.current = false;
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }

    const hasPermission = await checkMicrophonePermission();
    setAudioCheckStatus((prev) => ({
      ...prev,
      microphonePermission: hasPermission,
    }));

    const isCompatible = checkBrowserCompatibility();
    setAudioCheckStatus((prev) => ({
      ...prev,
      browserCompatible: isCompatible,
    }));

    const devices = await getAvailableAudioDevices();
    setAudioCheckStatus((prev) => ({
      ...prev,
      deviceSelected: devices.length > 0,
    }));

    const networkQuality = await checkNetworkQuality();
    setAudioCheckStatus((prev) => ({
      ...prev,
      networkQuality,
    }));

    if (hasPermission && isCompatible) {
      await startAudioLevelDetection(selectedDeviceId || undefined);
    } else {
      // Only show modal if not already shown
      if (!modalShownRef.current) {
        modalShownRef.current = true;
        setAudioNotDetected(true);
        if (isStarted && onAudioMessage) {
          onAudioMessage(audioMessage);
          modalTimeoutRef.current = setTimeout(() => {
            setShowAudioModal(true);
          }, 2000);
        } else {
          modalTimeoutRef.current = setTimeout(() => {
            setShowAudioModal(true);
          }, 1000);
        }
      }
    }
  }, [
    checkMicrophonePermission,
    checkBrowserCompatibility,
    getAvailableAudioDevices,
    checkNetworkQuality,
    startAudioLevelDetection,
    isStarted,
    onAudioMessage,
    audioMessage,
    selectedDeviceId,
  ]);

  // Function to trigger silence detection from external sources (e.g., Retell SDK)
  const triggerSilenceDetection = useCallback(
    (skipMessage = false) => {
      console.log(
        "[useAudioDetection] triggerSilenceDetection called, isStarted:",
        isStarted,
        "skipMessage:",
        skipMessage,
      );
      if (isStarted) {
        console.log("[useAudioDetection] Setting up silence detection...");
        // Always allow triggering, but reset the flag if audio is detected again
        modalShownRef.current = true;
        setAudioNotDetected(true);
        setAudioCheckStatus((prev) => ({
          ...prev,
          audioLevelDetected: false,
        }));

        // Only set message if not skipped (message might already be set)
        if (!skipMessage) {
          console.log(
            "[useAudioDetection] Calling onAudioMessage with:",
            audioMessage,
          );
          if (onAudioMessage) {
            onAudioMessage(audioMessage);
          }
        } else {
          console.log("[useAudioDetection] Skipping message (already set)");
        }

        // Clear any existing timeout
        if (modalTimeoutRef.current) {
          clearTimeout(modalTimeoutRef.current);
        }

        // Show modal immediately when triggered externally
        console.log("[useAudioDetection] Showing modal immediately");
        setShowAudioModal(true);
      } else {
        console.log(
          "[useAudioDetection] Not started yet, ignoring silence detection",
        );
      }
    },
    [isStarted, onAudioMessage, audioMessage],
  );

  return {
    audioNotDetected,
    showAudioModal,
    audioCheckStatus,
    audioStreamRef,
    audioLevel,
    availableDevices,
    selectedDeviceId,
    isTestingMic,
    performAudioChecks,
    stopAudioLevelDetection,
    setShowAudioModal,
    changeDevice,
    testMicrophone,
    triggerSilenceDetection,
  };
};
