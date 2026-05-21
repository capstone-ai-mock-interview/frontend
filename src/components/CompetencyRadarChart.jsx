import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ALL_TYPES = ["학습력", "문제해결력", "협업능력", "기술역량", "주도성", "스트레스내성", "직무적합성"];
const DEFAULT_SCORE = 3;

export default function CompetencyRadarChart({ chartData, strengthTypes, weaknessTypes }) {
  if (!chartData || Object.keys(chartData).length === 0) return null;

  const data = ALL_TYPES.map((subject) => {
    const raw = chartData[subject] != null ? Number(chartData[subject]) : DEFAULT_SCORE;
    return {
      subject,
      value: raw > 0 ? raw : DEFAULT_SCORE,
      fullMark: 10,
    };
  });

  let strengths = [];
  let weaknesses = [];
  try {
    strengths = typeof strengthTypes === "string" ? JSON.parse(strengthTypes) : strengthTypes || [];
  } catch { strengths = []; }
  try {
    weaknesses = typeof weaknessTypes === "string" ? JSON.parse(weaknessTypes) : weaknessTypes || [];
  } catch { weaknesses = []; }

  const hasAnalysis = strengths.length > 0 || weaknesses.length > 0;

  return (
    <div>
      <h3>역량 분석</h3>
      <div className={`competency-layout ${hasAnalysis ? "with-analysis" : ""}`}>
        <div className="competency-chart">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar
                name="역량"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.35}
              />
              <Tooltip formatter={(v) => `${v}점`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {hasAnalysis && (
          <div className="competency-analysis">
            {strengths.length > 0 && (
              <div className="analysis-section strength">
                <h4>💪 강점</h4>
                {strengths.map((item, i) => (
                  <p key={i}><strong>{item.type}</strong> — {item.comment}</p>
                ))}
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="analysis-section weakness">
                <h4>📝 보완점</h4>
                {weaknesses.map((item, i) => (
                  <p key={i}><strong>{item.type}</strong> — {item.comment}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
