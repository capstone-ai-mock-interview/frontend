import { useEffect, useRef, useState } from "react";

/**
 * 로컬 마이크 오디오 레벨을 실시간으로 측정하는 훅.
 * @param {object} options
 * @param {boolean} options.enabled - 측정 활성화 여부 (마이크 ON일 때만)
 * @param {number} [options.fftSize=256] - AnalyserNode FFT 크기
 * @returns {number} 0~1 사이의 정규화된 오디오 레벨
 */
export default function useAudioLevel({ enabled = false, fftSize = 256 } = {}) {
  const [level, setLevel] = useState(0);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLevel(0);
      return undefined;
    }

    let disposed = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (disposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = fftSize;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function tick() {
          if (disposed) return;
          analyser.getByteFrequencyData(dataArray);
          // RMS 기반 레벨 계산
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          // 0~255 범위를 0~1로 정규화 (약간의 부스트 적용)
          const normalized = Math.min(1, rms / 128);
          setLevel(normalized);
          rafRef.current = requestAnimationFrame(tick);
        }
        tick();
      } catch {
        // 마이크 접근 실패 시 무시 (LiveKit이 이미 마이크를 사용 중일 수 있음)
        setLevel(0);
      }
    }

    start();

    return () => {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setLevel(0);
    };
  }, [enabled, fftSize]);

  return level;
}
