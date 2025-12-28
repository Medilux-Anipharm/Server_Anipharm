/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: 약제품 정보 및 검색 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PetMedication:
 *       type: object
 *       properties:
 *         medicationId:
 *           type: integer
 *           description: 약제품 고유 ID
 *         originalId:
 *           type: string
 *           description: 원본 데이터 ID
 *         productName:
 *           type: string
 *           description: 제품명
 *         brandName:
 *           type: string
 *           nullable: true
 *           description: 브랜드명
 *         company:
 *           type: string
 *           nullable: true
 *           description: 제조사
 *         approvalDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: 허가일
 *         approvalStatus:
 *           type: string
 *           nullable: true
 *           description: 허가 상태
 *         productType:
 *           type: string
 *           nullable: true
 *           description: 품목정보 (동물용의약품/의약외품)
 *         manufacturingType:
 *           type: string
 *           nullable: true
 *           description: 제조 타입
 *         indication:
 *           type: string
 *           nullable: true
 *           description: 효능효과
 *         dosage:
 *           type: string
 *           nullable: true
 *           description: 용법용량
 *         sideEffects:
 *           type: string
 *           nullable: true
 *           description: 부작용
 *         precautions:
 *           type: string
 *           nullable: true
 *           description: 주의사항
 *         storage:
 *           type: string
 *           nullable: true
 *           description: 보관방법
 *         keywords:
 *           type: string
 *           nullable: true
 *           description: 검색 키워드
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 * 
 *     MedicationSearchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 성공 여부
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PetMedication'
 *         count:
 *           type: integer
 *           description: 검색 결과 개수
 * 
 *     MedicationRecommendResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 성공 여부
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PetMedication'
 *         count:
 *           type: integer
 *           description: 추천 결과 개수
 * 
 *     MedicationDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 성공 여부
 *         data:
 *           $ref: '#/components/schemas/PetMedication'
 * 
 *     MedicationImportResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 성공 여부
 *         message:
 *           type: string
 *           description: 응답 메시지
 *         data:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: 저장된 데이터 개수
 *             processed:
 *               type: integer
 *               description: 처리된 데이터 개수
 *             skipped:
 *               type: integer
 *               description: 건너뛴 데이터 개수
 * 
 *     KeywordExtractResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 성공 여부
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: 입력 메시지
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *               description: 추출된 키워드
 *             hasMedicationKeywords:
 *               type: boolean
 *               description: 약제품 관련 키워드 존재 여부
 */

/**
 * @swagger
 * /api/medications/import:
 *   post:
 *     summary: 약제품 데이터 Import (관리자용)
 *     description: JSON 파일에서 약제품 데이터를 읽어서 DB에 저장합니다.
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 약제품 데이터 import 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationImportResponse'
 *             example:
 *               success: true
 *               message: 약제품 데이터를 성공적으로 저장했습니다.
 *               data:
 *                 count: 1000
 *                 processed: 1000
 *                 skipped: 0
 *       500:
 *         description: Import 실패
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
 *                   example: JSON 데이터 import 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/medications/search:
 *   get:
 *     summary: 키워드로 약제품 검색
 *     description: 키워드를 입력하여 약제품을 검색합니다. 제품명, 효능효과, 키워드 등에서 검색합니다.
 *     tags: [Medications]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "검색 키워드 (예: 구토, 피부염, 치아)"
 *         example: 구토
 *       - in: query
 *         name: species
 *         required: false
 *         schema:
 *           type: string
 *           enum: [강아지, 고양이]
 *         description: 반려동물 종류 (필터링용)
 *         example: 강아지
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 50
 *         description: 검색 결과 개수 제한
 *         example: 5
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationSearchResponse'
 *             example:
 *               success: true
 *               data:
 *                 - medicationId: 1
 *                   productName: 구토 치료제
 *                   company: 제약회사
 *                   indication: 구토 증상 완화
 *                   dosage: 1일 2회, 1회 1정
 *               count: 1
 *       400:
 *         description: 잘못된 요청 (검색어 누락)
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
 *                   example: 검색어를 입력해주세요.
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/medications/recommend:
 *   get:
 *     summary: 건강 고민별 약제품 추천
 *     description: 건강 고민 타입에 따라 관련 약제품을 추천합니다.
 *     tags: [Medications]
 *     parameters:
 *       - in: query
 *         name: concernType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [dental, joint, skin, eye, kidney, vomit, aging, nutrition, heart, obesity, constipation, immunity]
 *         description: 건강 고민 타입
 *         example: vomit
 *       - in: query
 *         name: species
 *         required: true
 *         schema:
 *           type: string
 *           enum: [강아지, 고양이]
 *         description: 반려동물 종류
 *         example: 강아지
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 3
 *           minimum: 1
 *           maximum: 10
 *         description: 추천 결과 개수 제한
 *         example: 3
 *     responses:
 *       200:
 *         description: 추천 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationRecommendResponse'
 *             example:
 *               success: true
 *               data:
 *                 - medicationId: 1
 *                   productName: 구토 치료제
 *                   indication: 구토 증상 완화
 *               count: 1
 *       400:
 *         description: 잘못된 요청 (필수 파라미터 누락)
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
 *                   example: 건강 고민 타입을 입력해주세요.
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/medications/extract-keywords:
 *   post:
 *     summary: 사용자 메시지에서 약제품 키워드 추출 (테스트용)
 *     description: 사용자 메시지에서 약제품 관련 키워드를 추출합니다. RAG 검색을 위한 테스트용 API입니다.
 *     tags: [Medications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 사용자 메시지
 *                 example: 구토하는데 약 추천해주세요
 *     responses:
 *       200:
 *         description: 키워드 추출 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordExtractResponse'
 *             example:
 *               success: true
 *               data:
 *                 message: 구토하는데 약 추천해주세요
 *                 keywords: ['약', '약물']
 *                 hasMedicationKeywords: true
 *       400:
 *         description: 잘못된 요청 (메시지 누락)
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
 *                   example: 메시지를 입력해주세요.
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/medications/{medicationId}:
 *   get:
 *     summary: 약제품 상세 정보 조회
 *     description: 약제품 ID로 상세 정보를 조회합니다.
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 약제품 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 약제품 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationDetailResponse'
 *             example:
 *               success: true
 *               data:
 *                 medicationId: 1
 *                 productName: 구토 치료제
 *                 company: 제약회사
 *                 indication: 구토 증상 완화
 *                 dosage: 1일 2회, 1회 1정
 *                 precautions: 수의사와 상의 후 사용
 *       404:
 *         description: 약제품을 찾을 수 없음
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
 *                   example: 해당 약제품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */

