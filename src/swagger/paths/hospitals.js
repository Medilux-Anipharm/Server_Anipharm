/**
 * @swagger
 * tags:
 *   name: VeterinaryHospital
 *   description: 동물병원 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VeterinaryHospital:
 *       type: object
 *       properties:
 *         hospitalId:
 *           type: integer
 *           description: 병원 고유 ID
 *         name:
 *           type: string
 *           description: 병원명
 *         address:
 *           type: string
 *           description: 도로명 주소
 *         phone:
 *           type: string
 *           description: 전화번호
 *         operatingHours:
 *           type: string
 *           description: 운영시간
 *         website:
 *           type: string
 *           description: 홈페이지 URL
 *         latitude:
 *           type: number
 *           format: double
 *           description: 위도
 *         longitude:
 *           type: number
 *           format: double
 *           description: 경도
 *         is24h:
 *           type: boolean
 *           description: 24시간 운영 여부
 *         isEmergency:
 *           type: boolean
 *           description: 응급 병원 여부
 *         ratingAverage:
 *           type: number
 *           format: double
 *           description: 평균 평점
 *         reviewCount:
 *           type: integer
 *           description: 리뷰 개수
 *     MapMarker:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         position:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *             lng:
 *               type: number
 *         title:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         is24h:
 *           type: boolean
 *         isEmergency:
 *           type: boolean
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: integer
 */

/**
 * @swagger
 * /api/hospitals/import:
 *   post:
 *     summary: CSV 데이터 import (관리자용)
 *     tags: [VeterinaryHospital]
 *     description: 동물병원 CSV 파일을 읽어서 데이터베이스에 저장합니다.
 *     responses:
 *       200:
 *         description: 성공적으로 데이터를 저장했습니다.
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
 *                   example: 동물병원 데이터를 성공적으로 저장했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     count:
 *                       type: number
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/nearby:
 *   get:
 *     summary: 주변 동물병원 검색
 *     tags: [VeterinaryHospital]
 *     description: 위치 기반으로 주변 동물병원을 검색합니다.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: 검색 반경 (km)
 *         example: 5
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryHospital'
 *       400:
 *         description: 잘못된 요청 (위도/경도 누락)
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/search:
 *   get:
 *     summary: 키워드로 동물병원 검색
 *     tags: [VeterinaryHospital]
 *     description: 병원명 또는 주소로 동물병원을 검색합니다.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색 키워드 (병원명 또는 주소)
 *         example: 강남
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 결과 개수 제한
 *         example: 20
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryHospital'
 *       400:
 *         description: 잘못된 요청 (키워드 누락)
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/markers:
 *   get:
 *     summary: 네이버 지도 API용 마커 데이터 조회
 *     tags: [VeterinaryHospital]
 *     description: 네이버 지도에 표시할 마커 데이터를 반환합니다.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: 검색 반경 (km)
 *         example: 5
 *     responses:
 *       200:
 *         description: 마커 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MapMarker'
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/24hour:
 *   get:
 *     summary: 24시간 운영 병원 조회
 *     tags: [VeterinaryHospital]
 *     description: 24시간 운영하는 동물병원 목록을 조회합니다.
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryHospital'
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/top-rated:
 *   get:
 *     summary: 평점 높은 병원 조회
 *     tags: [VeterinaryHospital]
 *     description: 평점이 높은 동물병원 목록을 조회합니다 (최소 리뷰 5개 이상).
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 결과 개수 제한
 *         example: 10
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryHospital'
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/hospitals/{hospitalId}:
 *   get:
 *     summary: 동물병원 상세 정보 조회
 *     tags: [VeterinaryHospital]
 *     description: 특정 동물병원의 상세 정보를 조회합니다 (사진, 리뷰 포함).
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 병원 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VeterinaryHospital'
 *       404:
 *         description: 병원을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
