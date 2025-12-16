/**
 * @swagger
 * tags:
 *   name: HealthRecord
 *   description: 건강 기록 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthRecord:
 *       type: object
 *       properties:
 *         recordId:
 *           type: integer
 *           description: 건강 기록 고유 ID
 *         petId:
 *           type: integer
 *           description: 반려동물 ID
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         recordDate:
 *           type: string
 *           format: date
 *           description: 기록 날짜
 *         recordType:
 *           type: string
 *           enum: [meal, water, urine, feces, activity, weight, symptom]
 *           description: 기록 유형
 *         mealAmount:
 *           type: number
 *           format: double
 *           nullable: true
 *           description: 식사량
 *         waterAmount:
 *           type: number
 *           format: double
 *           nullable: true
 *           description: 물 섭취량
 *         urineColor:
 *           type: string
 *           nullable: true
 *           description: 소변 색상
 *         fecesConsistency:
 *           type: string
 *           nullable: true
 *           description: 배변 일관성
 *         fecesColor:
 *           type: string
 *           nullable: true
 *           description: 배변 색상
 *         fecesPhotoUrl:
 *           type: string
 *           nullable: true
 *           description: 배변 사진 URL
 *         activityMinutes:
 *           type: integer
 *           nullable: true
 *           description: 활동 시간 (분)
 *         weightKg:
 *           type: number
 *           format: double
 *           nullable: true
 *           description: 체중 (kg)
 *         symptoms:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: 증상 정보 (JSON 배열)
 *         symptomPhotoUrls:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: 증상 사진 URL 배열
 *         memo:
 *           type: string
 *           nullable: true
 *           description: 메모 (최대 1000자)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 시간
 */

/**
 * @swagger
 * /api/health/records:
 *   post:
 *     summary: 건강 기록 생성
 *     tags: [HealthRecord]
 *     description: 반려동물의 건강 기록을 생성합니다. 최소 하나 이상의 건강 기록 데이터를 입력해야 합니다.
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
 *               - recordDate
 *               - recordType
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               recordDate:
 *                 type: string
 *                 format: date
 *                 description: 기록 날짜
 *                 example: "2024-01-15"
 *               recordType:
 *                 type: string
 *                 enum: [meal, water, urine, feces, activity, weight, symptom]
 *                 description: 기록 유형
 *                 example: meal
 *               mealAmount:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *                 description: 식사량
 *                 example: 150.5
 *               waterAmount:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *                 description: 물 섭취량
 *                 example: 200.0
 *               urineColor:
 *                 type: string
 *                 nullable: true
 *                 description: 소변 색상
 *                 example: 노란색
 *               fecesConsistency:
 *                 type: string
 *                 nullable: true
 *                 description: 배변 일관성
 *                 example: 정상
 *               fecesColor:
 *                 type: string
 *                 nullable: true
 *                 description: 배변 색상
 *                 example: 갈색
 *               fecesPhotoUrl:
 *                 type: string
 *                 nullable: true
 *                 description: 배변 사진 URL
 *                 example: "https://example.com/feces.jpg"
 *               activityMinutes:
 *                 type: integer
 *                 nullable: true
 *                 description: 활동 시간 (분)
 *                 example: 30
 *               weightKg:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *                 description: 체중 (kg)
 *                 example: 25.5
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: 증상 정보
 *                 example: ["기침", "재채기"]
 *               symptomPhotoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: 증상 사진 URL 배열
 *                 example: ["https://example.com/symptom1.jpg"]
 *               memo:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *                 description: 메모
 *                 example: 오늘 아침부터 기침을 자주 해요
 *     responses:
 *       201:
 *         description: 건강 기록 생성 성공
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
 *                   example: 건강 기록이 등록되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
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
 *                   example: 최소 하나 이상의 건강 기록 데이터를 입력해야 합니다.
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/health/records/{recordId}:
 *   put:
 *     summary: 건강 기록 수정
 *     tags: [HealthRecord]
 *     description: 기존 건강 기록을 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
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
 *               recordDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: 기록 날짜
 *               recordType:
 *                 type: string
 *                 enum: [meal, water, urine, feces, activity, weight, symptom]
 *                 nullable: true
 *                 description: 기록 유형
 *               mealAmount:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *               waterAmount:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *               urineColor:
 *                 type: string
 *                 nullable: true
 *               fecesConsistency:
 *                 type: string
 *                 nullable: true
 *               fecesColor:
 *                 type: string
 *                 nullable: true
 *               fecesPhotoUrl:
 *                 type: string
 *                 nullable: true
 *               activityMinutes:
 *                 type: integer
 *                 nullable: true
 *               weightKg:
 *                 type: number
 *                 format: double
 *                 nullable: true
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *               symptomPhotoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *               memo:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: 건강 기록 수정 성공
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
 *                   example: 건강 기록이 수정되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 *   delete:
 *     summary: 건강 기록 삭제
 *     tags: [HealthRecord]
 *     description: 건강 기록을 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 건강 기록 삭제 성공
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
 *                   example: 건강 기록이 삭제되었습니다.
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/health/records/{recordId}/feces-photo:
 *   put:
 *     summary: 배변 사진 저장/업데이트
 *     tags: [HealthRecord]
 *     description: 건강 기록의 배변 사진을 저장하거나 업데이트합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - photoUrl
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               photoUrl:
 *                 type: string
 *                 description: 배변 사진 URL
 *                 example: "https://example.com/feces.jpg"
 *     responses:
 *       200:
 *         description: 배변 사진 저장 성공
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
 *                   example: 배변 사진이 저장되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없거나 권한이 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/health/records/{recordId}/symptom-photos:
 *   post:
 *     summary: 증상 사진 추가
 *     tags: [HealthRecord]
 *     description: 건강 기록에 증상 사진을 추가합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - photoUrl
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               photoUrl:
 *                 type: string
 *                 description: 증상 사진 URL
 *                 example: "https://example.com/symptom.jpg"
 *     responses:
 *       200:
 *         description: 증상 사진 추가 성공
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
 *                   example: 증상 사진이 추가되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없거나 권한이 없음
 *       500:
 *         description: 서버 오류
 *   put:
 *     summary: 증상 사진 전체 교체
 *     tags: [HealthRecord]
 *     description: 건강 기록의 증상 사진 배열을 전체 교체합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
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
 *               photoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: 증상 사진 URL 배열
 *                 example: ["https://example.com/symptom1.jpg", "https://example.com/symptom2.jpg"]
 *     responses:
 *       200:
 *         description: 증상 사진 업데이트 성공
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
 *                   example: 증상 사진이 업데이트되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없거나 권한이 없음
 *       500:
 *         description: 서버 오류
 *   delete:
 *     summary: 증상 사진 삭제
 *     tags: [HealthRecord]
 *     description: 건강 기록에서 특정 증상 사진을 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 건강 기록 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - photoUrl
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: 반려동물 ID
 *                 example: 1
 *               photoUrl:
 *                 type: string
 *                 description: 삭제할 증상 사진 URL
 *                 example: "https://example.com/symptom.jpg"
 *     responses:
 *       200:
 *         description: 증상 사진 삭제 성공
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
 *                   example: 증상 사진이 삭제되었습니다.
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 건강 기록을 찾을 수 없거나 권한이 없음
 *       500:
 *         description: 서버 오류
 */

