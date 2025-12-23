// 헬스챗봇 관련 서비스
// 건강상담모드 / 케어관리모드 
const { Pet, HealthCheck, ChatMessage, HealthRecord, sequelize } = require('../models');
const { Op } = require('sequelize');
const petService = require('./petService');
const healthCheckService = require('./healthCheckService');
const healthRecordService = require('./HealthRecord');
const chatbotService = require('./chatbotService');

class HealthChatbotService {
  /**
   * 건강상태 상담 시작 (자가검진 필수)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {object} healthCheckData - 건강 체크표 데이터
   * @returns {Promise<object>} 건강 체크표 ID
   */
  async startHealthStatusChat(petId, userId, healthCheckData) {
    try {
      // 1. 건강 체크표 생성 (healthCheckService에서 checkId 반환)
      const { concernType, appetite, activity, temperature, note } = healthCheckData;
      const healthCheck = await healthCheckService.createHealthCheck(
        petId, userId, concernType, appetite, activity, temperature, note
      );
      console.log('건강상담모드 챗봇 시작 - 건강체크표 생성 완료:', healthCheck);

      return {
        healthCheckId: healthCheck.checkId
      };
    } catch (error) {
      console.error('건강상태 상담 시작 오류:', error);
      throw error;
    }
  }

  /**
   * 케어 관리 상담 시작 (자가검진 없음)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<object>} 상담 세션 정보
   */
  async startCareManagementChat(petId, userId) {
    try {
      // 케어 관리 상담은 자가검진 없이 바로 시작
      // healthCheckId는 항상 null
      return {
        healthCheckId: null
      };
    } catch (error) {
      console.error('케어 관리 상담 시작 오류:', error);
      throw error;
    }
  }

  /**
   * 챗봇 메시지 전송 및 응답 생성
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형 ('health_status' | 'care_management')
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담 시 필수)
   * @param {string} userMessage - 사용자 메시지
   * @returns {Promise<object>} 챗봇 응답
   */
  async sendMessage(petId, userId, conversationType, healthCheckId, userMessage, userLocation = null) {
    try {
      // 0. healthCheckId 유효성 검사 (제공된 경우)
      if (healthCheckId) {
        try {
          const healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
          
        } catch (error) {
          // 건강체크표를 찾을 수 없는 경우 더 명확한 에러 메시지
          if (error.message.includes('건강체크표를 찾을 수 없습니다')) {
            throw new Error(`건강 체크표를 찾을 수 없습니다. healthCheckId: ${healthCheckId}가 존재하지 않거나 삭제되었을 수 있습니다.`);
          }
          throw error;
        }
      }

      // 1. 사용자 메시지 저장
      const lastMessage = await this._getLastMessageOrder(petId, userId, conversationType, healthCheckId);
      const userMessageRecord = await ChatMessage.create({
        petId,
        userId,
        conversationType,
        healthCheckId: healthCheckId || null, // NULL로 명시적 변환
        role: 'user',
        content: userMessage,
        messageOrder: lastMessage + 1
      });

      // 2. 대화 기록 조회 (최근 N개)
      const conversationHistory = await this._getConversationHistory(
        petId, userId, conversationType, healthCheckId, 10
      );

      // 3. 반려동물 컨텍스트 수집
      const pet = await petService.getPetById(petId);
      const petContext = await this._gatherPetContext(petId);
      
      // 4. 건강 체크표 조회 (건강상태 상담인 경우)
      let healthCheck = null;
      if (healthCheckId) {
        healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
      }

      // 5. 프롬프트 구성 (chatbotService 사용)
      let messages;

      // RAG: 사용자 메시지에서 약제품 관련 키워드 추출 및 검색
      const medicationService = require('./medicationService');
      const medicationKeywords = medicationService.extractMedicationKeywords(userMessage);
      let dynamicMedicationContext = '';
      
      // 증상 키워드 추출 (약제품 키워드가 없어도 증상 키워드로 검색)
      const symptomKeywords = this._extractSymptomKeywords(userMessage);
      console.log('추출된 약제 키워드:', medicationKeywords);
      console.log('추출된 증상 키워드:', symptomKeywords);
      
      // 증상 키워드가 있으면 증상 기반 검색, 없으면 약제품 키워드로 검색
      const searchKeywords = symptomKeywords.length > 0 ? symptomKeywords : medicationKeywords;
      
      if (searchKeywords.length > 0) {
        for (const keyword of searchKeywords) {
          console.log(`약제품 검색 시도: ${keyword}, 종류: ${pet.species}`);
          const medications = await medicationService.searchByKeyword(keyword, pet.species, 3);
          console.log(`검색 결과: ${medications.length}개 약제품 발견`);
          
          if (medications.length > 0) {
            dynamicMedicationContext = medicationService.formatMedicationsForChat(medications);
            console.log('약제품 정보 추가됨:', dynamicMedicationContext.substring(0, 100) + '...');
            break;
          }
        }
      }
      
      // 약제품 정보가 없고 건강 고민이 있으면 건강 고민 기반으로도 검색 시도
      if (!dynamicMedicationContext && healthCheck && healthCheck.concernType) {
        console.log(`건강 고민 기반 약제품 검색: ${healthCheck.concernType}`);
        const medications = await medicationService.recommendByHealthConcern(
          healthCheck.concernType,
          pet.species,
          3
        );
        if (medications.length > 0) {
          dynamicMedicationContext = medicationService.formatMedicationsForChat(medications);
          console.log('건강 고민 기반 약제품 정보 추가됨');
        }
      }

      // 위치 기반 동물병원/약국 정보 수집
      let locationContext = '';
      // 병원/약국 관련 키워드 확인 (더 포괄적으로)
      const needsLocationInfo = /병원|약국|동물병원|동물약국|근처|주변|가까운|찾아|알려|추천|위치/.test(userMessage);
      
      console.log(`[위치 기반 검색] 위치 정보 확인:`, userLocation);
      console.log(`[위치 기반 검색] 병원/약국 관련 질문 여부:`, needsLocationInfo);
      console.log(`[위치 기반 검색] 사용자 메시지:`, userMessage);
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        console.log(`[위치 기반 검색] 사용자 위치: ${userLocation.latitude}, ${userLocation.longitude}`);
        
        try {
          const pharmacyService = require('./pharmacyService');
          const hospitalService = require('./hospitalService');
          
          // 주변 약국 검색 (5km 반경)
          const nearbyPharmacies = await pharmacyService.findNearbyPharmacies(
            userLocation.latitude,
            userLocation.longitude,
            5
          );
          console.log('chatbot 주변 약국 검색 결과:', nearbyPharmacies);
          // 주변 병원 검색 (5km 반경)
          const nearbyHospitals = await hospitalService.findNearbyHospitals(
            userLocation.latitude,
            userLocation.longitude,
            5
          );
          
          console.log(`[위치 기반 검색] 약국 ${nearbyPharmacies.length}개, 병원 ${nearbyHospitals.length}개 발견`);
          
          // 위치 정보 포맷팅
          if (nearbyPharmacies.length > 0 || nearbyHospitals.length > 0) {
            locationContext = '\n\n';
            locationContext += '═══════════════════════════════════════════════════════════════\n';
            locationContext += '📍 주변 동물병원/약국 정보 (반드시 확인 필수!)\n';
            locationContext += '═══════════════════════════════════════════════════════════════\n';
            locationContext += `현재 위치 기준 반경 5km 내 검색 결과\n\n`;
            
            if (nearbyHospitals.length > 0) {
              locationContext += `🏥 주변 동물병원 (총 ${nearbyHospitals.length}개, 상위 3개):\n\n`;
              nearbyHospitals.slice(0, 3).forEach((hospital, index) => {
                locationContext += `${index + 1}. ${hospital.name}`;
                if (hospital.is24h) locationContext += ' [24시간 운영]';
                if (hospital.isEmergency) locationContext += ' [응급 진료]';
                locationContext += `\n   📍 주소: ${hospital.address}`;
                if (hospital.phone) locationContext += `\n   📞 전화번호: ${hospital.phone}`;
                locationContext += `\n   📏 거리: 약 ${hospital.distance.toFixed(2)}km\n\n`;
              });
            } else {
              locationContext += `🏥 주변 동물병원: 검색 결과 없음\n\n`;
            }
            
            if (nearbyPharmacies.length > 0) {
              locationContext += `💊 주변 동물약국 (총 ${nearbyPharmacies.length}개, 상위 3개):\n\n`;
              nearbyPharmacies.slice(0, 3).forEach((pharmacy, index) => {
                locationContext += `${index + 1}. ${pharmacy.name}`;
                if (pharmacy.is24h) locationContext += ' [24시간 운영]';
                if (pharmacy.isEmergency) locationContext += ' [응급 약국]';
                locationContext += `\n   📍 주소: ${pharmacy.address}`;
                if (pharmacy.phone) locationContext += `\n   📞 전화번호: ${pharmacy.phone}`;
                locationContext += `\n   📏 거리: 약 ${pharmacy.distance.toFixed(2)}km\n\n`;
              });
            } else {
              locationContext += `💊 주변 동물약국: 검색 결과 없음\n\n`;
            }
            
            locationContext += '⚠️ 위 정보는 참고용이며, 실제 방문 전 전화로 운영시간을 확인하세요.\n';
            locationContext += '═══════════════════════════════════════════════════════════════\n';
          }
        } catch (error) {
          console.error('[위치 기반 검색] 오류:', error);
          // 위치 검색 실패해도 계속 진행
        }
      }

      if (conversationType === 'health_status') {
        messages = await chatbotService.buildHealthStatusPrompt(
          pet, healthCheck, petContext, conversationHistory, false
        );
        
        // 약제품 정보가 있으면 별도의 assistant 메시지로 추가 (AI가 더 잘 인식하도록)
        if (dynamicMedicationContext) {
          console.log('[약제품 RAG] 약제품 정보를 프롬프트에 추가합니다.');
          console.log('[약제품 RAG] 약제품 정보 길이:', dynamicMedicationContext.length);
          console.log('[약제품 RAG] 약제품 정보 미리보기:', dynamicMedicationContext.substring(0, 200));
          
          // 시스템 프롬프트에 약제품 정보 추가
          messages[0].content += dynamicMedicationContext;
          messages[0].content += '\n\n**필수 지침: 위의 "RAG로 검색된 약제품 정보" 섹션을 반드시 확인하세요. 사용자가 약물에 대해 질문하거나 관련 증상을 언급한 경우, 위의 약제품 정보를 반드시 참고하여 구체적인 약제품 이름, 효능효과, 용법을 포함하여 답변해야 합니다. 약제품 정보가 있다면 반드시 언급하고 설명해야 합니다.';
          
          // 약제품 정보를 별도의 assistant 메시지로도 추가 (AI가 더 잘 인식하도록)
          messages.push({
            role: 'assistant',
            content: `약제품 정보를 확인했습니다. ${dynamicMedicationContext.substring(0, 100)}... (전체 정보는 위 시스템 프롬프트 참조)`
          });
        } else {
          console.log('[약제품 RAG] 약제품 정보가 없습니다.');
        }
        
        // 위치 정보 추가
        if (locationContext) {
          console.log('[위치 정보] 주변 병원/약국 정보를 프롬프트에 추가합니다.');
          messages[0].content += locationContext;
          
          if (locationContext.includes('주변 동물병원/약국 정보')) {
            // 병원/약국 정보가 있는 경우
            messages[0].content += '\n\n**필수 지침: 위의 "주변 동물병원/약국 정보" 섹션에 병원이나 약국 정보가 포함되어 있습니다. 사용자가 "근처 병원 알려줘", "주변 약국", "가까운 병원", "동물병원 찾아줘", "근처 동물병원", "동물약국 알려줘", "약국 찾아줘" 등 병원/약국에 대한 질문을 하면 (단어가 "병원", "약국", "동물병원", "동물약국" 중 하나라도 포함되면), 반드시 위의 주변 병원/약국 정보를 참고하여 구체적으로 답변해야 합니다. 각 병원/약국의 이름, 주소, 전화번호, 거리를 반드시 포함하여 답변하세요. 병원/약국 정보가 있다면 반드시 언급하고 설명해야 합니다. "찾을 수 없습니다"라고 답변하지 마세요.';
          } else {
            // 위치 정보가 없는 경우
            messages[0].content += '\n\n**지침: 사용자가 병원/약국에 대한 질문을 했지만 위치 정보가 없어 주변 병원/약국을 찾을 수 없습니다. 사용자에게 위치 정보를 제공해달라고 안내하세요.';
          }
        }
        
        // 사용자 메시지 추가
        const userMessageWithContext = dynamicMedicationContext 
          ? `${userMessage}\n\n**중요: 위의 시스템 프롬프트에 포함된 "RAG로 검색된 약제품 정보"를 반드시 확인하고, 해당 약제품 정보를 참고하여 구체적으로 답변해주세요. 약제품 이름, 효능효과, 용법을 반드시 포함하여 설명해주세요. 약제품 정보가 있다면 반드시 언급해야 합니다.`
          : userMessage;
        
        messages.push({
          role: 'user',
          content: userMessageWithContext
        });
        
        console.log('[약제품 RAG] 최종 프롬프트 메시지 수:', messages.length);
        if (dynamicMedicationContext) {
          console.log('[약제품 RAG] 시스템 프롬프트에 약제품 정보 포함됨');
        }
      } else {
        messages = await chatbotService.buildCareManagementPrompt(
          pet, healthCheck, petContext, conversationHistory
        );
        
        // 약제품 정보가 있으면 별도의 assistant 메시지로 추가 (AI가 더 잘 인식하도록)
        if (dynamicMedicationContext) {
          console.log('[약제품 RAG] 약제품 정보를 프롬프트에 추가합니다.');
          console.log('[약제품 RAG] 약제품 정보 길이:', dynamicMedicationContext.length);
          console.log('[약제품 RAG] 약제품 정보 미리보기:', dynamicMedicationContext.substring(0, 200));
          
          // 시스템 프롬프트에 약제품 정보 추가
          messages[0].content += dynamicMedicationContext;
          messages[0].content += '\n\n**필수 지침: 위의 "RAG로 검색된 약제품 정보" 섹션을 반드시 확인하세요. 사용자가 약물에 대해 질문하거나 관련 증상을 언급한 경우, 위의 약제품 정보를 반드시 참고하여 구체적인 약제품 이름, 효능효과, 용법을 포함하여 답변해야 합니다. 약제품 정보가 있다면 반드시 언급하고 설명해야 합니다.';
          
          // 약제품 정보를 별도의 assistant 메시지로도 추가 (AI가 더 잘 인식하도록)
          messages.push({
            role: 'assistant',
            content: `약제품 정보를 확인했습니다. ${dynamicMedicationContext.substring(0, 100)}... (전체 정보는 위 시스템 프롬프트 참조)`
          });
        } else {
          console.log('[약제품 RAG] 약제품 정보가 없습니다.');
        }
        
        // 위치 정보 추가
        if (locationContext) {
          console.log('[위치 정보] 주변 병원/약국 정보를 프롬프트에 추가합니다.');
          messages[0].content += locationContext;
          messages[0].content += '\n\n**지침: 위의 주변 동물병원/약국 정보가 제공된 경우, 사용자가 병원이나 약국에 대한 질문을 하면 해당 정보를 참고하여 답변할 수 있습니다.';
        }
        
        // 사용자 메시지 추가
        const userMessageWithContext = dynamicMedicationContext 
          ? `${userMessage}\n\n**중요: 위의 시스템 프롬프트에 포함된 "RAG로 검색된 약제품 정보"를 반드시 확인하고, 해당 약제품 정보를 참고하여 구체적으로 답변해주세요. 약제품 이름, 효능효과, 용법을 반드시 포함하여 설명해주세요. 약제품 정보가 있다면 반드시 언급해야 합니다.`
          : userMessage;
        
        messages.push({
          role: 'user',
          content: userMessageWithContext
        });
        
        console.log('[약제품 RAG] 최종 프롬프트 메시지 수:', messages.length);
        if (dynamicMedicationContext) {
          console.log('[약제품 RAG] 시스템 프롬프트에 약제품 정보 포함됨');
        }
      }

      // 6. OpenAI 호출
      const openaiResponse = await chatbotService.sendMessage(messages);
      const assistantMessage = openaiResponse.choices[0].message.content;

      // 7. 어시스턴트 메시지 저장
      await ChatMessage.create({
        petId,
        userId,
        conversationType,
        healthCheckId,
        role: 'assistant',
        content: assistantMessage,
        messageOrder: lastMessage + 2
      });

      // 8. 응답 파싱 (JSON 형식인 경우)
      let parsedResponse = assistantMessage;
      try {
        parsedResponse = JSON.parse(assistantMessage);
      } catch (e) {
        // JSON이 아니면 그대로 반환
      }

      return {
        message: assistantMessage,
        parsed: parsedResponse
      };
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      throw error;
    }
  }

  /**
   * 건강 평가 생성 (건강상태 상담 전용)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {number} healthCheckId - 건강 체크표 ID
   * @returns {Promise<object>} 평가 결과
   */
  async generateHealthAssessment(petId, userId, healthCheckId) {
    try {
      // 1. 데이터 수집
      const pet = await petService.getPetById(petId);
      const healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
      const petContext = await this._gatherPetContext(petId);
      const conversationHistory = await this._getConversationHistory(
        petId, userId, 'health_status', healthCheckId, 20
      );

      // 2. 프롬프트 구성 (평가용, chatbotService 사용)
      const messages = await chatbotService.buildHealthStatusPrompt(
        pet, healthCheck, petContext, conversationHistory, true
      );

      // 3. OpenAI 호출 (평가 모드이므로 JSON 형식 필수)
      const openaiResponse = await chatbotService.sendMessage(messages, true);
      const assessmentText = openaiResponse.choices[0].message.content;

      // 4. JSON 파싱
      let assessment;
      try {
        assessment = JSON.parse(assessmentText);
      } catch (e) {
        throw new Error('평가 결과 파싱 실패: ' + e.message);
      }

      // 5. 검증 및 후처리
      this._validateAssessment(assessment);

      return assessment;
    } catch (error) {
      console.error('건강 평가 생성 오류:', error);
            throw error;
        }
    }

  // ============ Private Helper Methods ============

  /**
   * 반려동물 컨텍스트 수집 (최근 건강 기록 등)
   */
  async _gatherPetContext(petId) {
    try {
      // 최근 7일 건강 기록 조회
      const recentRecords = await HealthRecord.findAll({
        where: { petId },
        order: [['record_date', 'DESC'], ['created_at', 'DESC']],
        limit: 10
      });

      return {
        recentHealthRecords: recentRecords.map(record => ({
          date: record.recordDate,
          type: record.recordType,
          symptoms: record.symptoms,
          weight: record.weightKg,
          memo: record.memo
        }))
      };
    } catch (error) {
      console.error('반려동물 컨텍스트 수집 오류:', error);
      return { recentHealthRecords: [] };
    }
  }

  /**
   * 대화 기록 조회
   */
  async _getConversationHistory(petId, userId, conversationType, healthCheckId, limit = 10) {
    const where = {
      petId,
      userId,
      conversationType
    };
    
    if (healthCheckId) {
      where.healthCheckId = healthCheckId;
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['message_order', 'ASC']],
      limit
    });

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 마지막 메시지 순서 조회
   */
  async _getLastMessageOrder(petId, userId, conversationType, healthCheckId) {
    const where = {
      petId,
      userId,
      conversationType
    };
    
    if (healthCheckId) {
      where.healthCheckId = healthCheckId;
    }

    const lastMessage = await ChatMessage.findOne({
      where,
      order: [['message_order', 'DESC']]
    });

    return lastMessage ? lastMessage.messageOrder : 0;
  }

  /**
   * 사용자 메시지에서 증상/질병 키워드 추출
   * @private
   */
  _extractSymptomKeywords(message) {
    const symptomKeywords = [
      '비듬', '가려움', '피부염', '알레르기', '발진', '피부',
      '구토', '설사', '변비', '소화불량', '소화',
      '기침', '재채기', '콧물', '코',
      '무기력', '식욕부진', '체중감소', '식욕',
      '다음', '소변', '배뇨', '요로',
      '눈물', '결막염', '안구', '눈',
      '치석', '구취', '잇몸', '치아', '구강',
      '관절', '보행', '절뚝거림', '뼈',
      '열', '체온', '발열',
      '호흡', '숨', '호흡곤란'
    ];

    return symptomKeywords.filter(keyword => message.includes(keyword));
  }


  /**
   * 대화 스크립트 생성
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담인 경우)
   * @param {number|null} conversationId - 대화 ID (케어 관리 상담인 경우, 첫 메시지 ID)
   * @returns {Promise<object>} 대화 스크립트
   */
  async getConversationScript(petId, userId, conversationType, healthCheckId = null, conversationId = null) {
    try {
      // 1. 반려동물 정보 조회
      const pet = await petService.getPetById(petId);
      
      // 2. 대화 기록 조회
      const where = {
        petId,
        userId,
        conversationType
      };
      
      if (healthCheckId) {
        where.healthCheckId = healthCheckId;
      } else if (conversationId) {
        // 케어 관리 상담인 경우 conversationId로 첫 메시지 찾기
        // conversationId가 첫 메시지 ID이므로, 해당 메시지의 시간 범위로 필터링
        const firstMessage = await ChatMessage.findOne({
          where: {
            messageId: conversationId,
            petId,
            userId,
            conversationType
          }
        });
        
        if (firstMessage) {
          // 첫 메시지 시간 기준으로 30분 이내의 메시지들 조회
          const startTime = new Date(firstMessage.createdAt || firstMessage.created_at);
          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30분 후
          
          where.createdAt = {
            [Op.between]: [startTime, endTime]
          };
        }
      }

      const messages = await ChatMessage.findAll({
        where,
        order: [['message_order', 'ASC'], ['created_at', 'ASC']],
        attributes: ['message_id', 'pet_id', 'user_id', 'health_check_id', 'conversation_type', 'role', 'content', 'message_order', 'created_at', 'updated_at'],
        raw: false // Sequelize 인스턴스로 반환 (createdAt 자동 변환)
      });

      if (messages.length === 0) {
        throw new Error('대화 기록이 없습니다.');
      }

      // 3. 스크립트 포맷팅
      const scriptLines = [];
      const conversationTypeLabel = conversationType === 'health_status' ? '건강상태 상담' : '케어 관리 상담';
      
      // 헤더 정보
      scriptLines.push(`=== ${pet.name} ${conversationTypeLabel} 대화 스크립트 ===`);
      
      // 안전한 날짜 포맷팅 함수
      const formatDate = (date) => {
        if (!date) return '날짜 정보 없음';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '날짜 정보 없음';
        return dateObj.toLocaleString('ko-KR');
      };
      
      const formatDateTime = (date) => {
        if (!date) return '날짜 정보 없음';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '날짜 정보 없음';
        return dateObj.toLocaleString('ko-KR', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };
      
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      
      scriptLines.push(`상담 시작: ${formatDate(firstMsg?.createdAt || firstMsg?.created_at)}`);
      scriptLines.push(`상담 종료: ${formatDate(lastMsg?.createdAt || lastMsg?.created_at)}`);
      scriptLines.push(`총 메시지 수: ${messages.length}개`);
      scriptLines.push('');

      // 대화 내용
      messages.forEach((msg, index) => {
        const roleLabel = msg.role === 'user' ? '사용자' : '챗봇';
        const createdAt = msg.createdAt || msg.created_at;
        const time = formatDateTime(createdAt);
        
        scriptLines.push(`[${index + 1}] ${roleLabel} (${time})`);
        scriptLines.push(msg.content || '');
        scriptLines.push('');
      });

      const script = scriptLines.join('\n');

      return {
        petId,
        petName: pet.name,
        conversationType,
        conversationTypeLabel,
        healthCheckId,
        messageCount: messages.length,
        startTime: firstMsg?.createdAt || firstMsg?.created_at,
        endTime: lastMsg?.createdAt || lastMsg?.created_at,
        script,
        messages: messages.map(msg => ({
          messageId: msg.messageId,
          role: msg.role,
          roleLabel: msg.role === 'user' ? '사용자' : '챗봇',
          content: msg.content,
          messageOrder: msg.messageOrder,
          createdAt: msg.createdAt || msg.created_at
        }))
      };
    } catch (error) {
      console.error('대화 스크립트 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 대화 종료 처리
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담인 경우)
   * @returns {Promise<object>} 종료 정보 및 대화 요약
   */
  async endConversation(petId, userId, conversationType, healthCheckId = null) {
    try {
      // 1. 대화 기록 조회
      const where = {
        petId,
        userId,
        conversationType
      };
      
      if (healthCheckId) {
        where.healthCheckId = healthCheckId;
      }

      const messages = await ChatMessage.findAll({
        where,
        order: [['message_order', 'ASC'], ['created_at', 'ASC']]
      });

      if (messages.length === 0) {
        throw new Error('대화 기록이 없습니다.');
      }

      // 2. 대화 요약 정보 생성
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      const userMessages = messages.filter(msg => msg.role === 'user');
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');

      // 3. 반려동물 정보 조회
      const pet = await petService.getPetById(petId);

      return {
        petId,
        petName: pet.name,
        conversationType,
        conversationTypeLabel: conversationType === 'health_status' ? '건강상태 상담' : '케어 관리 상담',
        healthCheckId,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        assistantMessageCount: assistantMessages.length,
        startTime: firstMsg?.createdAt || firstMsg?.created_at,
        endTime: new Date(), // 종료 시점
        duration: Math.round((new Date() - new Date(firstMsg?.createdAt || firstMsg?.created_at)) / 1000 / 60), // 분 단위
        summary: {
          firstUserMessage: userMessages[0]?.content || null,
          lastAssistantMessage: assistantMessages[assistantMessages.length - 1]?.content || null
        }
      };
    } catch (error) {
      console.error('대화 종료 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 대화 목록 조회
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @returns {Promise<Array>} 대화 목록
   */
  async getConversationList(petId, userId, conversationType) {
    try {
      const where = {
        petId,
        userId,
        conversationType
      };

      // 모든 메시지 조회
      const messages = await ChatMessage.findAll({
        where,
        order: [['created_at', 'ASC']],
        attributes: ['message_id', 'pet_id', 'user_id', 'health_check_id', 'conversation_type', 'role', 'content', 'message_order', 'created_at']
      });

      if (messages.length === 0) {
        return [];
      }

      // 메시지를 시간 범위로 그룹핑 (30분 간격)
      const conversations = [];
      let currentGroup = [];
      let groupStartTime = null;
      const GROUP_INTERVAL_MS = 30 * 60 * 1000; // 30분

      for (const msg of messages) {
        const msgTime = new Date(msg.created_at || msg.createdAt);
        
        if (!groupStartTime || (msgTime - groupStartTime) > GROUP_INTERVAL_MS) {
          // 새 그룹 시작
          if (currentGroup.length > 0) {
            conversations.push(this._createConversationSummary(currentGroup, petId, conversationType));
          }
          currentGroup = [msg];
          groupStartTime = msgTime;
        } else {
          // 같은 그룹에 추가
          currentGroup.push(msg);
        }
      }

      // 마지막 그룹 추가
      if (currentGroup.length > 0) {
        conversations.push(this._createConversationSummary(currentGroup, petId, conversationType));
      }

      // 최신순 정렬
      return conversations.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    } catch (error) {
      console.error('대화 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 대화 요약 생성 (내부 함수)
   */
  _createConversationSummary(messages, petId, conversationType) {
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');

    // healthCheckId 추출 (건강상태 상담인 경우)
    const healthCheckId = firstMsg.health_check_id || firstMsg.healthCheckId || null;

    // conversationId 생성 (healthCheckId가 있으면 사용, 없으면 첫 메시지 ID 사용)
    const conversationId = healthCheckId || firstMsg.message_id;

    return {
      conversationId,
      petId,
      conversationType,
      conversationTypeLabel: conversationType === 'health_status' ? '건강상태 상담' : '케어 관리 상담',
      healthCheckId,
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      startTime: firstMsg.created_at || firstMsg.createdAt,
      endTime: lastMsg.created_at || lastMsg.createdAt,
      duration: Math.round((new Date(lastMsg.created_at || lastMsg.createdAt) - new Date(firstMsg.created_at || firstMsg.createdAt)) / 1000 / 60), // 분 단위
      summary: {
        firstUserMessage: userMessages[0]?.content || null,
        lastAssistantMessage: assistantMessages[assistantMessages.length - 1]?.content || null
      }
    };
  }

  /**
   * 보관함 조회 (보관된 대화 목록)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @returns {Promise<Array>} 보관된 대화 목록
   */
  async getInboxList(petId, userId, conversationType) {
    try {
      // 현재는 모든 대화를 반환 (나중에 isArchived 플래그 추가 가능)
      // 실제로는 endConversation에서 saveReport: true일 때 표시를 해야 함
      // 일단 모든 대화를 반환하되, 최신순으로 정렬
      const conversations = await this.getConversationList(petId, userId, conversationType);
      
      // 보관된 대화만 필터링 (현재는 모든 대화 반환)
      // TODO: 나중에 isArchived 필드 추가하여 필터링
      return conversations;
    } catch (error) {
      console.error('보관함 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 평가 결과 검증
   */
  _validateAssessment(assessment) {
    const validLevels = ['BLUE', 'GREEN', 'AMBER', 'RED'];
    
    if (!assessment.triage_level || !validLevels.includes(assessment.triage_level)) {
      throw new Error('유효하지 않은 triage_level');
    }

    if (!Array.isArray(assessment.recommended_actions)) {
      throw new Error('recommended_actions는 배열이어야 합니다');
    }

    if (assessment.recommended_actions.length > 3) {
      assessment.recommended_actions = assessment.recommended_actions.slice(0, 3);
    }

    if (!assessment.health_check_summary || typeof assessment.health_check_summary !== 'string') {
      throw new Error('health_check_summary는 문자열이어야 합니다');
    }
  }
}

module.exports = new HealthChatbotService();
