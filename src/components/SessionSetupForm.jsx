import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Mic,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getMyResumes } from "../api/resumeApi";

const JOB_FIELDS = [
  { value: "BACKEND", label: "백엔드" },
  { value: "FRONTEND", label: "프론트엔드" },
  { value: "ANDROID", label: "안드로이드" },
  { value: "IOS", label: "iOS" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA", label: "데이터" },
  { value: "AI", label: "AI / ML" },
];

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];
const GROUP_SIZE_OPTIONS = [2, 3, 4];

const STEPS = [
  { id: 1, label: "면접 유형" },
  { id: 2, label: "이력서/직무" },
  { id: 3, label: "면접 시간" },
  { id: 4, label: "마이크 체크" },
];

const MIC_TEST = {
  CALIBRATION_MS: 800,
  REQUIRED_SPEECH_MS: 700,
  MIN_THRESHOLD: 0.018,
  NOISE_MULTIPLIER: 2.6,
};

const STEP_COPY = [
  {
    title: "어떤 방식으로 연습할까요?",
    description:
      "혼자 집중해서 답변을 다듬거나, 여러 명이 함께 들어가는 그룹 면접을 준비할 수 있어요.",
  },
  {
    title: "이력서와 지원 직무를 맞춰주세요",
    description:
      "선택한 정보는 질문의 방향과 피드백의 기준을 잡는 데 사용됩니다.",
  },
  {
    title: "연습 시간을 정해주세요",
    description:
      "전체 면접시간과 질문별 답변시간을 설정합니다.",
  },
  {
    title: "마이크를 확인하고 시작하세요",
    description:
      "음성 인식이 안정적으로 동작하는지 확인한 뒤 면접을 시작합니다.",
  },
];

export default function SessionSetupForm({ onSubmit, isSubmitting }) {
  const [step, setStep] = useState(1);

  const [interviewMode, setInterviewMode] = useState("SOLO");
  const [maxParticipants, setMaxParticipants] = useState(2);

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeLoading, setResumeLoading] = useState(true);

  const [jobField, setJobField] = useState("BACKEND");
  const [durationMinutes, setDurationMinutes] = useState(15);

  const [audioPermission, setAudioPermission] = useState("idle");
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioDetected, setAudioDetected] = useState(false);
  const [micPassed, setMicPassed] = useState(false);
  const [micTestPhase, setMicTestPhase] = useState("idle");
  const [micProgress, setMicProgress] = useState(0);
  const [agreeRule, setAgreeRule] = useState(false);

  const streamRef = useRef(null);
  const contextRef = useRef(null);
  const animationRef = useRef(null);
  const testStartedAtRef = useRef(0);
  const maxLevelRef = useRef(0);
  const smoothedLevelRef = useRef(0);
  const noiseFloorRef = useRef(0);
  const speechMsRef = useRef(0);
  const lastAudioTickRef = useRef(0);
  const reduceMotion = useReducedMotion();

  const isGroup = interviewMode === "GROUP";

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await getMyResumes();
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        if (list.length > 0) setSelectedResumeId(String(list[0].id));
      } catch {
        setResumes([]);
      } finally {
        setResumeLoading(false);
      }
    }
    loadResumes();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    cleanupMicResources();
  }, []);

  const cleanupMicResources = async () => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (contextRef.current) {
      await contextRef.current.close();
      contextRef.current = null;
    }
  };

  const startMicTest = async () => {
    try {
      await cleanupMicResources();
      setAudioPermission("requesting");
      setMicTestPhase("requesting");
      setMicPassed(false);
      setAudioDetected(false);
      setMicProgress(0);
      setAudioLevel(0);
      maxLevelRef.current = 0;
      smoothedLevelRef.current = 0;
      noiseFloorRef.current = 0;
      speechMsRef.current = 0;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.05;
      src.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      streamRef.current = stream;
      contextRef.current = ctx;
      testStartedAtRef.current = performance.now();
      lastAudioTickRef.current = testStartedAtRef.current;
      setAudioPermission("granted");
      setIsTestingMic(true);
      setMicTestPhase("calibrating");

      const loop = () => {
        const now = performance.now();
        const elapsed = now - testStartedAtRef.current;
        const delta = Math.min(100, now - lastAudioTickRef.current);
        lastAudioTickRef.current = now;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const n = (data[i] - 128) / 128;
          sum += n * n;
        }
        const rms = Math.sqrt(sum / data.length);
        const isCalibrating = elapsed < MIC_TEST.CALIBRATION_MS;
        if (isCalibrating) {
          noiseFloorRef.current =
            noiseFloorRef.current === 0
              ? rms
              : noiseFloorRef.current * 0.85 + rms * 0.15;
          setMicTestPhase("calibrating");
          setMicProgress(0);
        }

        const noiseFloor = Math.max(noiseFloorRef.current, 0.006);
        const threshold = Math.max(
          noiseFloor * MIC_TEST.NOISE_MULTIPLIER,
          MIC_TEST.MIN_THRESHOLD
        );
        const signal = Math.max(0, Math.min(1, (rms - threshold) / 0.12));
        const prev = smoothedLevelRef.current;
        const next =
          signal >= prev ? prev * 0.2 + signal * 0.8 : prev * 0.55 + signal * 0.45;
        const normalized = next < 0.015 ? 0 : next;
        smoothedLevelRef.current = normalized;
        maxLevelRef.current = Math.max(maxLevelRef.current, normalized);
        setAudioLevel(normalized);

        if (!isCalibrating) {
          setMicTestPhase("listening");
        }

        if (!isCalibrating && rms > threshold) {
          speechMsRef.current += delta;
        } else {
          speechMsRef.current = Math.max(0, speechMsRef.current - delta * 0.7);
        }
        setMicProgress(
          Math.min(100, (speechMsRef.current / MIC_TEST.REQUIRED_SPEECH_MS) * 100)
        );

        if (speechMsRef.current >= MIC_TEST.REQUIRED_SPEECH_MS) {
          setAudioDetected(true);
          setMicPassed(true);
          setMicTestPhase("passed");
          setMicProgress(100);
          cleanupMicResources();
          setIsTestingMic(false);
          return;
        }

        animationRef.current = window.requestAnimationFrame(loop);
      };
      animationRef.current = window.requestAnimationFrame(loop);
    } catch {
      setAudioPermission("denied");
      setMicTestPhase("denied");
      stopMicTest(false);
    }
  };

  const stopMicTest = async (validate = true) => {
    await cleanupMicResources();
    setIsTestingMic(false);
    smoothedLevelRef.current = 0;
    setAudioLevel(0);
    if (!validate) return;
    const passed =
      speechMsRef.current >= MIC_TEST.REQUIRED_SPEECH_MS || maxLevelRef.current > 0.6;
    setMicPassed(passed);
    setMicTestPhase(passed ? "passed" : "failed");
  };

  const goNext = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const selectedResume = resumes.find((r) => String(r.id) === selectedResumeId);
  const selectedJob = JOB_FIELDS.find((f) => f.value === jobField);
  const canProceedStep2 = resumes.length === 0 || Boolean(selectedResumeId);
  const isFirst = step === 1;
  const isLast = step === STEPS.length;
  const canSubmit = agreeRule && micPassed && !isSubmitting && canProceedStep2;
  const canGoNext = step === 1 || (step === 2 && canProceedStep2) || step === 3;

  const micStatusText = {
    idle: "테스트 전",
    requesting: "권한 요청 중...",
    granted: "권한 허용됨",
    denied: "권한 거부 또는 장치 오류",
  }[audioPermission];

  const micPhaseText = {
    idle: "테스트 시작을 누른 뒤 먼저 조용히 1초 정도 기다려 주세요.",
    requesting: "브라우저 마이크 권한을 요청하고 있습니다.",
    calibrating: "주변 소음을 측정 중입니다. 잠시 조용히 있어 주세요.",
    listening: "이제 평소 답변하듯 1초 정도 말해 주세요.",
    passed: "마이크 테스트를 통과했습니다.",
    failed: "음성이 충분히 감지되지 않았습니다. 다시 테스트해 주세요.",
    denied: "마이크 권한이 거부되었습니다. 브라우저 권한을 확인해 주세요.",
  }[micTestPhase];

  const summaryItems = useMemo(
    () => [
      {
        key: "mode",
        status: step > 1 ? "done" : step === 1 ? "active" : "pending",
        label: "유형",
        value: step >= 1 ? (isGroup ? `그룹 면접 (${maxParticipants}명)` : "일반 면접") : "",
      },
      {
        key: "job",
        status: step > 2 ? "done" : step === 2 ? "active" : "pending",
        label: "직무",
        value: step >= 2 ? selectedJob?.label ?? jobField : "",
      },
      {
        key: "resume",
        status: step > 2 ? "done" : step === 2 ? "active" : "pending",
        label: "이력서",
        value: step >= 2 ? selectedResume ? selectedResume.title : "미선택" : "",
      },
      {
        key: "time",
        status: step > 3 ? "done" : step === 3 ? "active" : "pending",
        label: "시간",
        value: step >= 3 ? `${durationMinutes}분` : "",
      },
    ],
    [durationMinutes, isGroup, jobField, maxParticipants, selectedJob, selectedResume, step]
  );

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.995 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      };

  const handleSubmit = () => {
    const payload = {
      jobField,
      durationMinutes: Number(durationMinutes),
      resumeIds: selectedResumeId ? Number(selectedResumeId) : null,
      mode: interviewMode,
    };
    if (isGroup) {
      payload.maxParticipants = Number(maxParticipants);
    }
    onSubmit(payload);
  };

  const renderModeCard = ({ value, title, description, Icon }) => (
    <button
      type="button"
      className={`setup-choice-card ${interviewMode === value ? "selected" : ""}`}
      onClick={() => setInterviewMode(value)}
    >
      <span className="setup-choice-icon">
        <Icon size={20} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      {interviewMode === value && <Check className="setup-choice-check" size={18} />}
    </button>
  );

  const Step1 = (
    <motion.div key="setup-step-mode" className="setup-step-body" {...panelMotion}>
      <div className="setup-choice-grid">
        {renderModeCard({
          value: "SOLO",
          title: "일반 면접",
          description: "AI 면접관과 1:1로 진행",
          Icon: UserRound,
        })}
        {renderModeCard({
          value: "GROUP",
          title: "그룹 면접",
          description: "초대 링크로 함께 연습",
          Icon: UsersRound,
        })}
      </div>

      <div className="setup-step1-extra">
        <AnimatePresence initial={false}>
          {isGroup ? (
            <motion.div className="setup-soft-panel" {...panelMotion}>
              <label className="field">
                <span>참가 인원 (본인 포함)</span>
                <div className="setup-segment-grid">
                  {GROUP_SIZE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`setup-segment ${maxParticipants === n ? "selected" : ""}`}
                      onClick={() => setMaxParticipants(n)}
                    >
                      {n}명
                    </button>
                  ))}
                </div>
              </label>
              <p className="subtext compact">
                방 생성 후 초대 링크를 공유하고, 모두 준비되면 면접이 시작됩니다.
              </p>
            </motion.div>
          ) : (
            <div className="setup-soft-panel setup-soft-panel-placeholder" aria-hidden="true" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const Step2 = (
    <motion.div key="setup-step-profile" className="setup-step-body" {...panelMotion}>
      <div className="setup-soft-panel">
        {resumeLoading ? (
          <p className="subtext">이력서 목록을 불러오는 중...</p>
        ) : resumes.length === 0 ? (
          <div className="setup-empty-state">
            <FileText size={22} />
            <div>
              <strong>등록된 이력서가 없습니다</strong>
              <p className="subtext compact">
                마이페이지에서 PDF 이력서를 먼저 등록하면 더 개인화된 질문을 받을 수 있어요.
              </p>
            </div>
          </div>
        ) : (
          <label className="field">
            <span>이력서 선택</span>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              required
            >
              <option value="">선택해 주세요</option>
              {resumes.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="field">
        <span>지원 직무</span>
        <div className="setup-job-grid">
          {JOB_FIELDS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`setup-job-chip ${jobField === f.value ? "selected" : ""}`}
              onClick={() => setJobField(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </label>
    </motion.div>
  );

  const Step3 = (
    <motion.div key="setup-step-duration" className="setup-step-body" {...panelMotion}>
      <label className="field">
        <span>면접 시간</span>
        <div className="setup-time-grid">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`setup-time-card ${durationMinutes === d ? "selected" : ""}`}
              onClick={() => setDurationMinutes(d)}
            >
              <strong>{d}</strong>
              <span>분</span>
            </button>
          ))}
        </div>
      </label>

      <div className="setup-answer-limit">
        <span>질문별 답변 시간</span>
        <strong>
          <Clock3 size={18} />
          1:30
        </strong>
      </div>
    </motion.div>
  );

  const Step4 = (
    <motion.div key="setup-step-mic" className="setup-step-body" {...panelMotion}>
      <div className="setup-mic-panel">
        <div className="setup-mic-orb-wrap">
          {isTestingMic && <span className="setup-mic-pulse" />}
          <div className={`setup-mic-orb ${micPassed ? "passed" : ""}`}>
            <Mic size={28} />
          </div>
        </div>

        <div className="setup-mic-content">
          <div className="setup-mic-header">
            <strong>{micPassed ? "마이크 감지 완료" : micStatusText}</strong>
            {(audioPermission === "granted" || micPassed) && (
              <span className={audioDetected ? "text-success" : "text-warn"}>
                {audioDetected ? "음성 감지됨" : "대기 중"}
              </span>
            )}
          </div>
          <p className="setup-mic-guide">{micPhaseText}</p>

          <div className="audio-meter setup-audio-meter">
            <div
              className="audio-meter-fill"
              style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
            />
          </div>
          <div className="setup-mic-progress">
            <span>통과 기준</span>
            <strong>{Math.round(micProgress)}%</strong>
            <div>
              <i style={{ width: `${micProgress}%` }} />
            </div>
          </div>

          <div className="audio-test-row">
            <button
              className="ghost-btn"
              type="button"
              onClick={startMicTest}
              disabled={isTestingMic}
            >
              {micPassed || micTestPhase === "failed" ? "다시 테스트" : "테스트 시작"}
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => stopMicTest(true)}
              disabled={!isTestingMic}
            >
              완료
            </button>
          </div>
        </div>
      </div>

      {audioPermission === "denied" && (
        <div className="notice warn">
          마이크 접근이 거부되었습니다. 브라우저 권한 설정을 확인해 주세요.
        </div>
      )}

      <label className="check-row setup-rule-check">
        <input
          type="checkbox"
          checked={agreeRule}
          onChange={(e) => setAgreeRule(e.target.checked)}
        />
        <span>질문당 최대 1분 30초 답변 제한 규칙을 확인했습니다.</span>
      </label>

      {!micPassed && (
        <div className="notice warn">
          마이크 테스트 통과 후 면접을 시작할 수 있습니다. 조용한 상태에서 시작한 뒤 짧게 말해 주세요.
        </div>
      )}
    </motion.div>
  );

  const stepContent = [Step1, Step2, Step3, Step4][step - 1];
  const currentCopy = STEP_COPY[step - 1];
  return (
    <div className="setup-page">
      <section className="setup-layout">
        <motion.div
          className="setup-main-card"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="setup-hero-row">
            <div>
              <h1>{currentCopy.title}</h1>
              <p className="subtext">{currentCopy.description}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">{stepContent}</AnimatePresence>

          <div className="setup-nav">
            <div>
              {!isFirst && (
                <button className="ghost-btn" type="button" onClick={goBack}>
                  <ChevronLeft size={16} />
                  이전
                </button>
              )}
            </div>
            <div className="step-nav-right">
              {isLast ? (
                <button
                  className="primary-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "세션 생성 중..." : isGroup ? "방 만들기" : "면접 시작"}
                </button>
              ) : (
                <button
                  className="primary-btn"
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                >
                  다음
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.aside
          className="setup-summary-card"
          initial={reduceMotion ? false : { opacity: 0, x: 14 }}
          animate={reduceMotion ? false : { opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
        >
          <div className="setup-summary-head">
            <h2>면접 준비 현황</h2>
          </div>

          <div className="setup-summary-list">
            {summaryItems.map((item) => (
              <motion.div
                layout
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`setup-summary-item is-${item.status}`}
                key={item.key}
              >
                <span>{item.label}</span>
                <AnimatePresence>
                  {item.status === "done" && (
                    <motion.span
                      className="setup-summary-check"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                      animate={reduceMotion ? false : { opacity: 1, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Check className="setup-summary-check-icon" size={24} strokeWidth={3.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {item.value && (
                    <motion.strong
                      key={item.value}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      {item.value}
                    </motion.strong>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.aside>
      </section>
    </div>
  );
}
