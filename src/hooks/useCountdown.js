import { useEffect, useMemo, useRef, useState } from "react";

export function toClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// 250ms 간격으로 폴링. 매초 미만의 잔여 시간 변화도 다음 초 경계에서 정확히 반영된다.
// (브라우저 setInterval throttling 으로 1초 간격에서 발생하던 누적 오차를 줄여준다.)
const TICK_INTERVAL_MS = 250;

function normalizeDeadline(value) {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

function computeSecondsLeft(deadline) {
  if (deadline == null) return 0;
  const ms = deadline - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

/**
 * 절대 시각(`expiresAt`) 기반 카운트다운 훅.
 *
 * 통합 계약 §6.2 ("startedAt/expiresAt 은 Backend 가 마스터") 에 맞추기 위해,
 * 프론트는 자체 클럭으로 누적하지 않고 매 tick 마다 `Math.ceil((expiresAt - Date.now()) / 1000)`
 * 로 남은 시간을 계산한다. 탭 백그라운드/시스템 슬립/시계 보정 후 복귀해도
 * 실제 만료 시각과 ±1초 이내로 동기화된다.
 *
 * @param {Object}              params
 * @param {number|string|null}  params.expiresAt  ms timestamp 또는 ISO 문자열. null 이면 휴면.
 * @param {boolean}             params.isActive   카운트다운 진행 여부.
 * @param {() => void}          params.onFinish   0 진입 시 단 한 번만 호출됨.
 * @returns {{ secondsLeft: number, formatted: string }}
 */
export default function useCountdown({ expiresAt, isActive, onFinish } = {}) {
  const deadline = normalizeDeadline(expiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(deadline));
  const firedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  // 최신 onFinish 를 ref 에 보관해 deps 에서 제외한다.
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // deadline 이 바뀌면 즉시 재계산하고 발화 게이트를 재무장한다.
  useEffect(() => {
    setSecondsLeft(computeSecondsLeft(deadline));
    firedRef.current = false;
  }, [deadline]);

  // 활성 상태에서만 tick. 매 tick 마다 deadline 기준으로 다시 계산.
  useEffect(() => {
    if (!isActive || deadline == null) return undefined;
    // 활성화되는 즉시 한 번 동기화 (대기 후 tick 까지 부정확한 표시 방지).
    setSecondsLeft(computeSecondsLeft(deadline));
    const timer = window.setInterval(() => {
      setSecondsLeft(computeSecondsLeft(deadline));
    }, TICK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isActive, deadline]);

  // 0 으로 처음 진입할 때만 onFinish 발화.
  // - deadline 이 null 이면(아직 미설정) 발화하지 않는다.
  // - secondsLeft 가 양수로 복귀하면 게이트 재무장.
  useEffect(() => {
    if (deadline == null) {
      firedRef.current = false;
      return;
    }
    if (secondsLeft > 0) {
      firedRef.current = false;
      return;
    }
    if (secondsLeft === 0 && !firedRef.current) {
      firedRef.current = true;
      onFinishRef.current?.();
    }
  }, [deadline, secondsLeft]);

  const formatted = useMemo(() => toClock(secondsLeft), [secondsLeft]);

  return { secondsLeft, formatted };
}
