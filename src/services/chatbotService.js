// src/services/chatbotService.js
// OpenAI API 호출 및 프롬프트 구성 담당



const OpenAI = require("openai");

class ChatbotService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.client = null; // 지연 초기화
  }

//   /**
//    * OpenAI 클라이언트 초기화 (지연 초기화)
//    * @private
//    */
  _getClient() {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. 환경 변수 OPENAI_API_KEY를 확인해주세요.');
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }

  /**
   * OpenAI API 호출
   * @param {Array} messages - 메시지 배열
   * @param {boolean} requireJson - JSON 형식 응답 필수 여부 (기본값: false)
   * @returns {Promise<object>} OpenAI 응답
   */
  async sendMessage(messages, requireJson = false) {
    try {
      const client = this._getClient(); // 지연 초기화
      
      // JSON 형식이 필요한 경우에만 response_format 설정
      const requestOptions = {
        model: this.model,
        messages: messages,
        temperature: 0.3
      };
      
      if (requireJson) {
        requestOptions.response_format = { type: "json_object" };
      }
      
      const completion = await client.chat.completions.create(requestOptions);

      return {
        choices: completion.choices,
        usage: completion.usage,
        model: completion.model
      };
    } catch (error) {
      // OpenAI SDK 에러 처리
      if (error.status === 401) {
        throw new Error('OpenAI API 인증 실패. API 키가 유효하지 않거나 만료되었습니다. OPENAI_API_KEY를 확인해주세요.');
      } else if (error.status === 429) {
        throw new Error('OpenAI API 요청 한도 초과. 잠시 후 다시 시도해주세요.');
      } else if (error.status === 500) {
        throw new Error('OpenAI API 서버 오류. 잠시 후 다시 시도해주세요.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('OpenAI API에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        throw new Error(`OpenAI API 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    }
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
  async buildHealthStatusPrompt(pet, healthCheck, petContext, conversationHistory = [], isAssessment = false) {
    const messages = [];
    let medicationContext = '';
    
    // RAG: 건강 고민 기반 약제품 검색 (healthChatbotService에서 동적으로 추가하므로 여기서는 제거)
    // 약제품 정보는 healthChatbotService에서 사용자 메시지와 함께 추가됨

    // 시스템 프롬프트
    messages.push({
      role: 'system',
      content: this._buildSystemPrompt(pet, healthCheck, petContext, isAssessment) + medicationContext
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
        content: `위의 건강 체크표와 전체 대화 내용을 종합적으로 분석하여 4단계 행동 가이드를 제시해주세요.

**중요:**
- 체크표의 자가검진 정보뿐만 아니라 대화에서 언급된 모든 증상, 우려사항, 관찰 사항을 반영해주세요.
- 대화 내용에서 추가로 파악된 정보가 있다면 반드시 고려해주세요.
- 체크표와 대화 내용이 일치하는지, 또는 대화에서 새로운 정보가 있는지 종합적으로 판단해주세요.

JSON 형식으로 응답해주세요:
{
  "triage_level": "BLUE|GREEN|AMBER|RED",
  "recommended_actions": ["조치1", "조치2", "조치3"],
  "health_check_summary": "체크표와 대화 내용을 종합한 요약"
}`
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

${isAssessment ? '**중요: 평가 응답은 반드시 JSON 형식으로 제공해주세요.**' : ''}

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
- 침습적 처치 금지
- 응급 증상 발견 시 즉시 병원 내원 안내
- 정보 제공용으로만 활용됨

약제품 정보 제공 시 (RAG 서비스):
- 약제품 정보가 RAG를 통해 제공되는 경우에만, 해당 약제품에 대한 정보를 제공할 수 있습니다.
- RAG로 제공된 약제품 정보를 바탕으로 사용자에게 도움이 될 수 있는 정보를 제공할 수 있습니다.
- 하지만 반드시 "수의사와 상의 후 사용하세요"라는 안내를 포함하세요.
- 처방전이 필요한 약물인 경우 명확히 표시하세요.
- RAG로 제공되지 않은 약제품은 추천하지 마세요.

주변 동물병원/약국 정보 제공 시:
- 시스템 프롬프트에 "주변 동물병원/약국 정보" 섹션이 포함되어 있는 경우, 사용자가 병원이나 약국에 대한 질문을 하면 반드시 해당 정보를 참고하여 답변해야 합니다.
- 사용자가 "근처 병원 알려줘", "주변 약국", "가까운 병원", "동물병원 찾아줘", "근처 동물병원", "동물약국 알려줘", "약국 찾아줘" 등 병원/약국 관련 질문을 하면 (단어가 "병원", "약국", "동물병원", "동물약국" 중 하나라도 포함되면), 위의 주변 병원/약국 정보를 반드시 포함하여 구체적으로 답변해야 합니다.
- 각 병원/약국의 이름, 주소, 전화번호, 거리를 반드시 포함하여 답변하세요.
- 병원/약국 정보가 제공되었는데도 "찾을 수 없습니다"라고 답변하지 마세요. 반드시 제공된 정보를 사용하여 답변하세요.
- "병원", "동물병원", "약국", "동물약국" 등 어떤 표현을 사용하든 모두 동일하게 처리하세요.

`;

    if (isAssessment) {
      prompt += `**평가 지침:**
위의 건강 체크표와 아래 대화 내용을 모두 종합적으로 분석하여 평가해주세요.

평가 시 다음 사항을 고려하세요:
1. 건강 체크표의 자가검진 정보 (건강 고민, 식욕, 활동, 체온, 메모)
2. 대화 내용에서 추가로 언급된 증상, 우려사항, 관찰 사항
3. 대화 흐름에서 파악된 반려동물의 상태 변화나 추가 정보
4. 체크표와 대화 내용이 일치하는지, 또는 대화에서 새로운 정보가 있는지

평가 시 다음 형식으로 JSON 형식으로 응답해주세요:
{
  "triage_level": "BLUE|GREEN|AMBER|RED",
  "recommended_actions": ["조치사항1", "조치사항2", "조치사항3"],
  "health_check_summary": "체크표와 대화 내용을 종합한 요약"
}`;
    } else {
      // 일반 대화에서는 자연스러운 대화 형식 사용
      prompt += `일반 대화에서는 자연스럽고 친근한 톤으로 응답해주세요.`;
    }

    return prompt;
  }


}

module.exports = new ChatbotService();