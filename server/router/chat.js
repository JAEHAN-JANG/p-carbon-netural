const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const db = require("../lib/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 평균값 (CO2 kg)
const AVERAGES = {
  electricity: 170,
  gas: 42,
  water: 8,
  fuel: 125,
  waste: 10,
};

const CATEGORIES = {
  electricity: "전기",
  gas: "가스",
  water: "수도",
  fuel: "교통",
  waste: "폐기물",
};

// 상세 분석 생성
function buildDetailedAnalysis(userData) {
  let detailed = "";
  const highs = [];

  for (const [key, value] of Object.entries(userData)) {
    const avg = AVERAGES[key];
    const diff = avg > 0 ? (((value - avg) / avg) * 100).toFixed(1) : "0.0";

    if (value > avg) {
      highs.push({ key, name: CATEGORIES[key], diff });
      detailed += `🔴 ${CATEGORIES[key]}: ${value}kg CO2 (평균 ${avg}kg 대비 ${diff}% 높음)\n`;
    } else {
      detailed += `✅ ${CATEGORIES[key]}: ${value}kg CO2 (평균 이하)\n`;
    }
  }

  return { detailed, highs };
}

// ❗ GPT 불가 시 제공할 TEXT 폴백
function buildFallbackText({ detailed, highs, userPrompt }) {
  const tips = [];

  for (const h of highs) {
    if (h.key === "electricity") {
      tips.push(
        "💡 전기: 대기전력 차단과 LED 전환으로 월 전기 사용을 약 10~20% 절감할 수 있어요."
      );
    }
    if (h.key === "gas") {
      tips.push(
        "🔥 가스: 보일러 온도 1~2℃ 조정과 타이머 사용으로 약 5~15% 절감이 가능합니다."
      );
    }
    if (h.key === "water") {
      tips.push(
        "🚿 수도: 절수 샤워기 사용과 사용 시간 단축으로 10~30% 절감 효과가 있어요."
      );
    }
    if (h.key === "fuel") {
      tips.push(
        "🚌 교통: 주 1~2회 대중교통 전환과 급가속/급제동 감소로 연료 사용을 줄일 수 있어요."
      );
    }
    if (h.key === "waste") {
      tips.push(
        "🗑 폐기물: 분리배출 철저와 일회용품 사용 감소가 효과적입니다."
      );
    }
  }

  if (tips.length === 0) {
    tips.push("✅ 현재 모든 항목이 평균 이하로 매우 잘 관리되고 있습니다. 현재 습관을 유지해 주세요.");
  }

  return [
    // "⚠️ 현재 AI 추천 기능(OpenAI API)이 일시적으로 제한되어 기본 가이드로 안내드립니다.",
    // "",
    // "[현재 배출 현황 분석]",
    detailed.trim(),
    "",
    highs.length > 0
      ? `평균보다 높은 항목: ${highs.map(h => `${h.name}(${h.diff}% 초과)`).join(", ")}`
      : "모든 항목이 평균 이하입니다.",
    "",
    "💡 실천 가능한 개선 방안",
    ...tips,
    "",
    userPrompt ? `📝 사용자 질문: ${userPrompt}` : ""
  ].join("\n");
}

router.post("/", async (req, res) => {
  const userPrompt = req.body.userPrompt || "";
  const userEmail = req.body.userEmail;

  if (!userEmail) {
    return res.status(400).send("userEmail이 필요합니다.");
  }

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  db.query(
    `SELECT electricity, gas, water, fuel, waste
     FROM carbon_emissions
     WHERE user_email = ?
       AND year = ?
       AND month = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userEmail, year, month],
    async (err, results) => {
      try {
        if (err) {
          console.error("DB 오류:", err);
          return res.status(500).send("데이터베이스 오류가 발생했습니다.");
        }

        if (!results || results.length === 0) {
          return res.send(
            "이번 달 탄소 배출 데이터가 없습니다. 먼저 데이터를 입력해 주세요."
          );
        }

        const { detailed, highs } = buildDetailedAnalysis(results[0]);

        const messages = [
          {
            role: "system",
            content:
              "당신은 친근하고 전문적인 탄소중립 컨설턴트입니다. 수치 기반 분석과 실천 가능한 감축 방안을 제시하세요.",
          },
          {
            role: "user",
            content: `현재 배출 현황:\n${detailed}\n\n개선 방안을 제시해 주세요.`,
          },
          { role: "user", content: userPrompt },
        ];

        // 🔥 OpenAI 호출 (여기서 429 나도 catch로 처리됨)
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 1000,
            temperature: 0.7,
          });

          return res.send(
            response.choices?.[0]?.message?.content ||
              "응답을 생성하지 못했습니다."
          );
        } catch (e) {
          const status = e?.status || e?.response?.status;
          const code = e?.code || e?.error?.code;

          console.error("OpenAI 오류:", status, code);
          const fallback = buildFallbackText({ detailed, highs, userPrompt });
          return res.send(fallback); // ✅ 항상 TEXT
        }
      } catch (e) {
        console.error("chat route error:", e);
        return res.status(500).send("서버 오류가 발생했습니다.");
      }
    }
  );
});

module.exports = router;
