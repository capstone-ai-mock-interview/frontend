import { useEffect, useState } from "react";

export default function HomeView({
                                   user,
                                   onStartInterview,
                                   onLogin,
                                   onOpenHistory,
                                 }) {
  const [leaveNotice, setLeaveNotice] = useState("");
  const [fortuneMsg, setFortuneMsg] = useState("");
  const fortunes = ["오늘의 면접은 분명 잘 될 거예요! ", "자신감을 가지세요! ", "긴장은 열정의 또 다른 이름이에요 ", "포기하지 않고 여기까지 온 당신, 대단해요! ", "당신의 경험과 열정은 특별해요! ", "진심은 언제나 통해요! ", "오늘 준비해온 모든 것이 꽃피울 거예요! "];
  const handleCrack = () => setFortuneMsg(fortunes[Math.floor(Math.random() * fortunes.length)]);

  useEffect(() => {
    const notice = sessionStorage.getItem("groupLeaveNotice");

    if (notice) {
      setLeaveNotice(notice);
      sessionStorage.removeItem("groupLeaveNotice");
    }
  }, []);

  return (
      <>
        <style>{`
        @import url('https://cdn.jsdelivr.net/gh/webfont-release/S-CoreDream@master/SCoreDream.css');
        @import url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2308@1.1/Paperlogy-3Light.woff2');

        body {
          margin: 0;
          background: #f8fbff;
          font-family: 'S-CoreDream', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        #root {
          min-height: 100vh;
          background: #f8fbff;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        .home-card {
          position: relative;
          overflow: visible;
          min-height: 100vh;
          padding: 80px 56px 80px;
          background: transparent;
          animation: fadeUp 1s ease;
        }

        .home-card::before {
          content: "";
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(219, 234, 254, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
          top: -150px;
          right: -100px;
          z-index: 1;
          pointer-events: none;
          animation: float 7s ease-in-out infinite;
        }

        .home-card::after {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(243, 232, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
          right: 300px;
          top: 100px;
          z-index: 1;
          pointer-events: none;
          animation: float 9s ease-in-out infinite;
        }

        .home-hero {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          padding-top: 20px;
        }

        .hero-left {
          flex: 1;
          max-width: 620px;
          animation: fadeUp 1s ease;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          color: #0055ff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
        }

        .home-hero h1 {
          margin: 0;
          font-size: 56px;
          line-height: 1.25;
          letter-spacing: -2px;
          font-weight: 850;
          font-family: 'Paperlogy', sans-serif;
        }

        .hero-sub {
          margin-top: 24px;
          color: #667085;
          font-size: 17px;
          line-height: 1.65;
          font-weight: 800;
        }

        .home-actions {
          display: flex;
          gap: 14px;
          margin-top: 40px;
        }

        .primary-btn {
          border: none;
          border-radius: 999px;
          background: #0055ff;
          color: white;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0, 85, 255, 0.2);
          cursor: pointer;
          transition: 0.25s;
        }

        .primary-btn:hover {
          background: #0044cc;
          transform: translateY(-3px);
        }

        .hero-chat {
          position: relative;
          flex: 1;
          max-width: 500px;
          animation: float 5s ease-in-out infinite;
        }

        .chat-window {
          position: relative;
          z-index: 3;
          border-radius: 32px;
          padding: 32px 24px;
          background: white;
          box-shadow: 0 24px 64px rgba(0, 85, 255, 0.04), 0 4px 16px rgba(0,0,0,0.01);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-left: 4px;
        }

        .header-blue-icon {
          width: 24px;
          height: 24px;
          background: #0055ff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-dots-gray {
          color: #98a2b3;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .chat-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .msg-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          animation: fadeUp 0.8s ease;
        }

        .msg-row.right {
          flex-direction: row-reverse;
        }

        .msg-bubble {
          max-width: 75%;
          padding: 14px 18px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }

        .msg-row.left .msg-bubble {
          background: #edf3ff;
          color: #1d2939;
          border-radius: 18px;
          border-top-left-radius: 4px;
        }

        .msg-row.right .msg-bubble {
          background: #f2f4f7;
          color: #1d2939;
          border-radius: 18px;
          border-top-right-radius: 4px;
        }

        .chat-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-avatar.bot { background: #e4e7ec; }
        .chat-avatar.user { background: #0055ff; }

        .msg-time {
          font-size: 11px;
          color: #98a2b3;
          margin-top: 4px;
          padding: 0 4px;
        }

        .voice-wave-inline {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          margin-top: 8px;
        }

        .voice-wave-inline span {
          width: 2px;
          background: #0055ff;
          border-radius: 2px;
          display: inline-block;
          animation: pulse 1s infinite;
        }

        .voice-wave-inline span:nth-child(1) { height: 6px; }
        .voice-wave-inline span:nth-child(2) { height: 12px; }
        .voice-wave-inline span:nth-child(3) { height: 8px; }
        .voice-wave-inline span:nth-child(4) { height: 14px; }
        .voice-wave-inline span:nth-child(5) { height: 10px; }
        .voice-wave-inline span:nth-child(6) { height: 6px; }

        .typing-dots-bubble {
          background: #f2f4f7;
          padding: 12px 16px;
          border-radius: 16px;
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }

        .typing-dots-bubble span {
          width: 6px;
          height: 6px;
          background: #98a2b3;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .floating-3d-purple {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 84px;
          height: 84px;
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          border-radius: 28px;
          border-bottom-right-radius: 8px;
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.35);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          animation: float 4s ease-in-out infinite;
        }

        .floating-3d-purple span {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          opacity: 0.9;
        }

        .feature-grid {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 80px;
        }

        .feature-card {
          padding: 30px;
          border-radius: 28px;
          background: rgba(255,255,255,0.76);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 12px 40px rgba(15,23,42,0.05);
          transition: 0.25s ease;
          animation: fadeUp 1s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 18px;
        }

        .mint .feature-icon { background: #eef4ff; }
        .purple .feature-icon { background: #f3efff; }
        .pink .feature-icon { background: #ebfff6; }

        .feature-card h3 {
          margin: 0 0 14px;
          color: #0f172a;
          font-size: 24px;
          font-weight: 800;
        }

        .feature-card p {
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
        }

        .fortune-section {
          position: relative;
          z-index: 3;
          margin-top: 70px;
          background: linear-gradient(135deg, #fff9ef, #fffdf8);
          border-radius: 34px;
          padding: 40px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(245, 158, 11, 0.15);
          box-shadow: 0 12px 40px rgba(15,23,42,0.04);
          animation: fadeUp 1s ease;
        }

        @media (max-width: 1200px) {
          .home-hero { flex-direction: column; }
          .feature-grid { grid-template-columns: 1fr; }
          .home-hero h1 { font-size: 52px; }
          .hero-chat { width: 100%; max-width: 100%; }
          .fortune-section {
            flex-direction: column;
            text-align: center;
            gap: 40px;
            padding: 40px 24px;
          }
        }
      `}</style>

        <div className="home-card">
          <div className="home-hero">
            <div className="hero-left">
              <div className="eyebrow">
                Realtime AI Mock Interview ✦
              </div>

              <h1 style={{ fontSize: "40px", whiteSpace: "nowrap" }}>
              <span style={{ color: "#0055ff" }}>
                수집된 최신 면접 데이터와
              </span>

                <br />

                <span style={{ color: "#0055ff" }}>
                개인의 이력이 만나는
              </span>{" "}

                <span style={{ color: "#0055ff", WebkitTextFillColor: "#0055ff", background: "none", WebkitBackgroundClip: "unset" }}>
                인터톡
              </span>
              </h1>

              <p className="hero-sub" style={{ fontWeight: 300, WebkitTextStroke: "0.3px #667085" }}>
                직무를 설정하고 음성으로 답변하면,
                <br />
                AI가 꼬리 질문과 함께
                종합 피드백 리포트를 제공합니다.
              </p>

              <div className="home-actions">
                {user ? (
                    <button
                        className="primary-btn"
                        type="button"
                        onClick={onStartInterview}
                    >
                      무료 면접 시작하기 →
                    </button>
                ) : (
                    <button
                        className="primary-btn"
                        type="button"
                        onClick={onLogin}
                    >
                      로그인하고 시작하기 →
                    </button>
                )}
              </div>
            </div>

            <div className="hero-chat">
              <div className="chat-window">
                <div className="chat-header">
                  <div className="header-blue-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                    </svg>
                  </div>
                  <div className="header-dots-gray">•••</div>
                </div>

                <div className="chat-body">
                  <div className="msg-row left">
                    <div className="chat-avatar bot">🤖</div>
                    <div>
                      <div className="msg-bubble">
                        자기소개를 간단히 해주세요.
                      </div>
                      <div className="msg-time">오후 02:30</div>
                    </div>
                  </div>

                  <div className="msg-row right">
                    <div className="chat-avatar user">👤</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div className="msg-bubble">
                        안녕하세요, 저는 사용자 경험을 중심으로 서비스를 개선하는 데 관심이 많습니다.
                        <br />
                        <div className="voice-wave-inline">
                          <span></span><span></span><span></span>
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                      <div className="msg-time">오후 02:31</div>
                    </div>
                  </div>

                  <div className="msg-row left">
                    <div className="chat-avatar bot">🤖</div>
                    <div>
                      <div className="msg-bubble">
                        그 경험을 통해 가장 성장했던 사례는 무엇인가요?
                      </div>
                      <div className="msg-time">오후 02:31</div>
                    </div>
                  </div>

                  <div className="msg-row left">
                    <div className="chat-avatar bot">🤖</div>
                    <div className="typing-dots-bubble">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-3d-purple">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-card mint">
              <div className="feature-icon">🎙️</div>
              <h3>실시간 음성 면접</h3>
              <p>
                LiveKit 기반 실시간 음성 연결로 실제 면접과 동일한 환경을 경험합니다.
              </p>
            </div>

            <div className="feature-card purple">
              <div className="feature-icon">🤖</div>
              <h3>RAG 기반 질문 생성</h3>
              <p>
                이력서와 자소서를 분석해 직무 맞춤 질문과 꼬리 질문을 생성합니다.
              </p>
            </div>

            <div className="feature-card pink">
              <div className="feature-icon">📊</div>
              <h3>AI 피드백 리포트</h3>
              <p>
                기술 정확성·논리성·전달력 지표와 함께 종합 분석 리포트를 제공합니다.
              </p>
            </div>
          </div>

          <div className="fortune-section">
            <div>
              <div style={{ color: "#d97706", fontSize: "12px", fontWeight: 800, marginBottom: "12px" }}>FORTUNE COOKIE</div>
              <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 800 }}>면접 전 행운 쿠키</h2>
              <p style={{ margin: "0 0 24px 0", color: "#4b5563" }}>쿠키를 깨면 오늘의 응원 메시지가 나와요 </p>
              {fortuneMsg && <div style={{ background: "linear-gradient(160deg,#fffef0,#fffde7)", border: "1px dashed #f6d860", borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", color: "#3d2c00", fontSize: "15px", lineHeight: 1.7 }}>{fortuneMsg}</div>}
              {!fortuneMsg ? (
                  <button onClick={handleCrack} style={{ background: "#f59e0b", color: "white", border: "none", padding: "12px 24px", borderRadius: "999px", fontWeight: 700, cursor: "pointer" }}>쿠키 깨기</button>
              ) : (
                  <button onClick={() => setFortuneMsg("")} style={{ background: "white", color: "#344054", border: "1px solid #d0d5dd", padding: "12px 24px", borderRadius: "999px", fontWeight: 700, cursor: "pointer" }}>새 쿠키 뽑기</button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", background: "white", color: "#d97706", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: "1px solid #fef3c7" }}>오늘의 면접도 당신을 응원해요!</div>
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
                <path d="M10 40 L80 90 L150 40 L150 110 L10 110 Z" fill="#FDE68A"/>
                <path d="M10 40 L80 90 L150 40 Z" fill="#FEF3C7"/>
                <rect x="65" y="20" width="30" height="60" fill="#EF4444" rx="2"/>
              </svg>
            </div>
          </div>
        </div>
      </>
  );
}
