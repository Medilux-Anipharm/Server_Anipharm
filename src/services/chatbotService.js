// src/services/chatbotService.js
// OpenAI API 호출 및 프롬프트 구성 담당
const axios = require("axios");

class ChatbotService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.baseUrl = "https://api.openai.com/v1";
  }

  /**
   * OpenAI API 호출
   * @param {Array} messages - 메시지 배열
   * @returns {Promise<object>} OpenAI 응답
   */
  async sendMessage(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  /**
   * 건강상태 상담용 프롬프트 구성
   * @param {object} pet - 반려동물 정보
   * @param {object} healthCheck - 건강 체크표
   * @param {object} petContext - 반려동물 컨텍스트 (최근 건강 기록 등)
   * @param {Array} conversationHistory - 대화 기록
   * @param {boolean} isAssessment - 평가 모드 여부
   * @returns {Array} 프롬프트 메시지 배열
   */
  buildHealthStatusPrompt(pet, healthCheck, petContext, conversationHistory = [], isAssessment = false) {
    const messages = [];

    // 시스템 프롬프트
    messages.push({
      role: 'system',
      content: this._buildSystemPrompt(pet, healthCheck, petContext, isAssessment)
    });

    // 대화 기록 추가
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // 평가 모드인 경우 평가 요청 추가
    if (isAssessment) {
      messages.push({
        role: 'user',
        content: '건강 체크표와 대화 내용을 종합하여 4단계 행동 가이드를 제시해주세요. JSON 형식으로 응답해주세요: {"triage_level": "BLUE|GREEN|AMBER|RED", "recommended_actions": ["조치1", "조치2", "조치3"], "health_check_summary": "요약"}'
      });
    }

    return messages;
  }

  /**
   * 케어 관리 상담용 프롬프트 구성
   * @param {object} pet - 반려동물 정보
   * @param {object|null} healthCheck - 건강 체크표 (선택)
   * @param {object} petContext - 반려동물 컨텍스트
   * @param {Array} conversationHistory - 대화 기록
   * @returns {Array} 프롬프트 메시지 배열
   */
  buildCareManagementPrompt(pet, healthCheck, petContext, conversationHistory = []) {
    const messages = [];

    // 시스템 프롬프트
    messages.push({
      role: 'system',
      content: this._buildSystemPrompt(pet, healthCheck, petContext, false)
    });

    // 대화 기록 추가
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    return messages;
  }

  /**
   * 시스템 프롬프트 구성
   * @private
   */
  _buildSystemPrompt(pet, healthCheck, petContext, isAssessment = false) {
    let prompt = `당신은 반려동물 1차 트리아지 보조원입니다. 의료행위는 할 수 없으며 정보 제공용으로만 활용됩니다.

반려동물 정보:
- 이름: ${pet.name}
- 종류: ${pet.species}
- 품종: ${pet.breed || '미상'}
- 성별: ${pet.gender || '미상'}
- 생년월일: ${pet.birthDate}
- 체중: ${pet.weight || '미측정'}kg
- 건강 고민: ${pet.healthConcerns?.join(', ') || '없음'}

`;

    if (healthCheck) {
      prompt += `건강 체크표:
- 건강 고민: ${healthCheck.concernType}
- 식욕: ${healthCheck.appetite}
- 활동: ${healthCheck.activity}
- 체온: ${healthCheck.temperature}
- 추가 메모: ${healthCheck.note || '없음'}

`;
    }

    if (petContext.recentHealthRecords?.length > 0) {
      prompt += `최근 건강 기록:\n`;
      petContext.recentHealthRecords.slice(0, 5).forEach(record => {
        prompt += `- ${record.date}: ${record.type}${record.symptoms ? `, 증상: ${JSON.stringify(record.symptoms)}` : ''}${record.memo ? `, 메모: ${record.memo}` : ''}\n`;
      });
      prompt += '\n';
    }

    prompt += `안전 규칙:
- 약물 추천 금지
- 침습적 처치 금지
- 응급 증상 발견 시 즉시 병원 내원 안내
- 정보 제공용으로만 활용됨

`;

    if (isAssessment) {
      prompt += `평가 시 다음 형식으로 JSON 응답:
{
  "triage_level": "BLUE|GREEN|AMBER|RED",
  "recommended_actions": ["조치사항1", "조치사항2", "조치사항3"],
  "health_check_summary": "자가검진 내용 요약"
}`;
    }

    return prompt;
  }
}

module.exports = new ChatbotService();