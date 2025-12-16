/**
 * @swagger
 * tags:
 *   name: HealthChatbot
 *   description: 건강 챗봇 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCheckData:
 *       type: object
 *       required:
 *         - concernType
 *         - appetite
 *         - activity
 *         - temperature
 *       properties:
 *         concernType:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           maxItems: 5
 *           description: 건강 고민 (최대 5개)
 *           example: ["구토", "신장/요로"]
 *         appetite:
 *           type: string
 *           enum: [정상, 감소, 거의 안 먹음, 증가]
 *           description: 식욕 상태
 *           example: 감소
 *         activity:
 *           type: string
 *           enum: [정상, 감소, 매우 무기력, 과도하게 활동적]
 *           description: 활동 상태
 *           example: 감소
 *         temperature:
 *           type: string
 *           enum: [정상(37.5~39.2), 낮음(≤37), 높음(≥39.5), 미측정]
 *           description: 체온
 *           example: 정상(37.5~39.2)
 *         note:
 *           type: string
 *           description: 추가 메모 (선택)
 *           example: 오늘 아침부터 구토를 3번 했어요
 *     HealthAssessment:
 *       type: object
 *       properties:
 *         triage_level:
 *           type: string
 *           enum: [BLUE, GREEN, AMBER, RED]
 *           description: "상담결과 (BLUE: 양호, GREEN: 주의, AMBER: 상담 권고, RED: 즉시 내원)"
 *           example: AMBER
 *         recommended_actions:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 3
 *           description: 권장 조치사항 요약 상위 3개
 *           example: ["24시간 이내 동물병원 방문 권고", "수분 섭취량 모니터링", "체온 및 호흡 상태 지속 관찰"]
 *         health_check_summary:
 *           type: string
 *           description: 자가검진 내용 요약
 *           example: "건강고민: 구토/신장/요로, 식욕: 감소, 활동: 감소, 체온: 정상(38.2°C)"
 */

/**
 * @swagger
 * /api/chatbot/health/start:
 *   post:
 *     summary: 건강상태 상담 시작 (자가검진 필수)
 *     tags: [HealthChatbot]
 *     description: 건강 체크표를 작성하고 건강상태 상담을 시작합니다. 자가검진이 필수입니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - healthCheckData
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               healthCheckData:
 *                 $ref: '#/components/schemas/HealthCheckData'
 *     responses:
 *       201:
 *         description: 건강상태 상담 시작 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 건강상태 상담이 시작되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthCheckId:
 *                       type: integer
 *                       description: 생성된 건강 체크표 ID
 *                       example: 123
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId와 healthCheckData는 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/chatbot/care/start:
 *   post:
 *     summary: 케어 관리 상담 시작 (자가검진 없음)
 *     tags: [HealthChatbot]
 *     description: 케어 관리 상담을 시작합니다. 자가검진 없이 바로 시작할 수 있습니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: 케어 관리 상담 시작 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 케어 관리 상담이 시작되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthCheckId:
 *                       type: null
 *                       description: 케어 관리 상담은 자가검진 없음
 *                       example: null
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId는 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: 챗봇 메시지 전송
 *     tags: [HealthChatbot]
 *     description: 챗봇에게 메시지를 전송하고 응답을 받습니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - conversationType
 *               - message
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               conversationType:
 *                 type: string
 *                 enum: [health_status, care_management]
 *                 description: 상담 유형
 *                 example: health_status
 *               healthCheckId:
 *                 type: integer
 *                 nullable: true
 *                 description: 건강 체크표 ID (건강상태 상담 시 필수)
 *                 example: 123
 *               message:
 *                 type: string
 *                 description: 사용자 메시지
 *                 example: 우리 강아지가 밥을 안 먹어요
 *     responses:
 *       200:
 *         description: 메시지 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 메시지가 전송되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 챗봇 응답 텍스트
 *                       example: "식욕 부진은 여러 원인이 있을 수 있습니다..."
 *                     parsed:
 *                       type: object
 *                       nullable: true
 *                       description: JSON 형식인 경우 파싱된 객체
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId, conversationType, message는 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/chatbot/health/assess:
 *   post:
 *     summary: 건강 평가 생성 (건강상태 상담 전용)
 *     tags: [HealthChatbot]
 *     description: 건강 체크표와 대화 내용을 종합하여 4단계 행동 가이드를 생성합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - healthCheckId
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               healthCheckId:
 *                 type: integer
 *                 description: 건강 체크표 ID
 *                 example: 123
 *     responses:
 *       200:
 *         description: 건강 평가 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 건강 평가가 생성되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthAssessment'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId와 healthCheckId는 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */


/**
 * @swagger
 * /api/chatbot/conversation/script:
 *   get:
 *     tags:
 *       - Health Chatbot
 *     summary: 대화 스크립트 조회
 *     description: 챗봇 대화 내용을 스크립트 형식으로 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 반려동물 ID
 *       - in: query
 *         name: conversationType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [health_status, care_management]
 *         description: 상담 유형
 *       - in: query
 *         name: healthCheckId
 *         required: false
 *         schema:
 *           type: integer
 *         description: 건강 체크표 ID (건강상태 상담인 경우 필수)
 *     responses:
 *       200:
 *         description: 대화 스크립트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 대화 스크립트를 조회했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     petId:
 *                       type: integer
 *                       example: 1
 *                     petName:
 *                       type: string
 *                       example: 뽀삐
 *                     conversationType:
 *                       type: string
 *                       example: health_status
 *                     conversationTypeLabel:
 *                       type: string
 *                       example: 건강상태 상담
 *                     healthCheckId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     messageCount:
 *                       type: integer
 *                       example: 10
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-16T10:00:00Z
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-16T10:30:00Z
 *                     script:
 *                       type: string
 *                       example: |
 *                         === 뽀삐 건강상태 상담 대화 스크립트 ===
 *                         상담 시작: 2025. 12. 16. 오전 10:00:00
 *                         상담 종료: 2025. 12. 16. 오전 10:30:00
 *                         총 메시지 수: 10개
 *                         
 *                         [1] 사용자 (2025. 12. 16. 오전 10:00:00)
 *                         우리 강아지가 밥을 안 먹어요
 *                         
 *                         [2] 챗봇 (2025. 12. 16. 오전 10:00:05)
 *                         어떤 걱정이 있으신가요?
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           messageId:
 *                             type: integer
 *                           role:
 *                             type: string
 *                             enum: [user, assistant]
 *                           roleLabel:
 *                             type: string
 *                             example: 사용자
 *                           content:
 *                             type: string
 *                           messageOrder:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId와 conversationType은 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/chatbot/conversation/end:
 *   post:
 *     tags:
 *       - Health Chatbot
 *     summary: 대화 종료
 *     description: 챗봇 대화를 종료하고 대화 요약 정보를 반환합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - conversationType
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               conversationType:
 *                 type: string
 *                 enum: [health_status, care_management]
 *                 description: 상담 유형
 *                 example: health_status
 *               healthCheckId:
 *                 type: integer
 *                 description: 건강 체크표 ID (건강상태 상담인 경우 필수)
 *                 example: 1
 *     responses:
 *       200:
 *         description: 대화 종료 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 대화가 종료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     petId:
 *                       type: integer
 *                       example: 1
 *                     petName:
 *                       type: string
 *                       example: 뽀삐
 *                     conversationType:
 *                       type: string
 *                       example: health_status
 *                     conversationTypeLabel:
 *                       type: string
 *                       example: 건강상태 상담
 *                     healthCheckId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     messageCount:
 *                       type: integer
 *                       example: 10
 *                     userMessageCount:
 *                       type: integer
 *                       example: 5
 *                     assistantMessageCount:
 *                       type: integer
 *                       example: 5
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-16T10:00:00Z
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-16T10:30:00Z
 *                     duration:
 *                       type: integer
 *                       description: 대화 지속 시간 (분)
 *                       example: 30
 *                     summary:
 *                       type: object
 *                       properties:
 *                         firstUserMessage:
 *                           type: string
 *                           example: 우리 강아지가 밥을 안 먹어요
 *                         lastAssistantMessage:
 *                           type: string
 *                           example: 24시간 이내 동물병원 방문을 권고합니다.
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: petId와 conversationType은 필수입니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
