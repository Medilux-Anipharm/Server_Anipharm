/**
 * @swagger
 * tags:
 *   name: VeterinaryPharmacy
 *   description: 동물약국 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VeterinaryPharmacy:
 *       type: object
 *       properties:
 *         pharmacyId:
 *           type: integer
 *           description: 약국 고유 ID
 *         name:
 *           type: string
 *           description: 약국명
 *         address:
 *           type: string
 *           description: 도로명 주소
 *         addressDetail:
 *           type: string
 *           description: 상세 주소
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
 *         isLateNight:
 *           type: boolean
 *           description: 심야 운영 여부
 *         is24h:
 *           type: boolean
 *           description: 24시간 운영 여부
 *         isEmergency:
 *           type: boolean
 *           description: 응급 약국 여부
 *         ratingAverage:
 *           type: number
 *           format: double
 *           description: 평균 평점
 *         reviewCount:
 *           type: integer
 *           description: 리뷰 개수
 *     PharmacyMarker:
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
 *         operatingHours:
 *           type: string
 *         website:
 *           type: string
 *         is24h:
 *           type: boolean
 *         isEmergency:
 *           type: boolean
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: integer
 *         distance:
 *           type: number
 *           format: double
 *           description: 거리 (km 단위)
 */

/**
 * @swagger
 * /api/pharmacies/import:
 *   post:
 *     summary: CSV 데이터 import (관리자용)
 *     tags: [VeterinaryPharmacy]
 *     description: 동물약국 CSV 파일을 읽어서 데이터베이스에 저장합니다. data/csv/동물약국.csv 파일을 읽어서 저장합니다.
 *     security:
 *       - bearerAuth: []
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
 *                   example: 동물약국 데이터를 성공적으로 저장했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     count:
 *                       type: integer
 *                       example: 150
 *       500:
 *         description: 서버 오류
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
 *                   example: CSV 데이터 import 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/pharmacies/nearby:
 *   get:
 *     summary: 주변 동물약국 검색
 *     tags: [VeterinaryPharmacy]
 *     description: 위치 기반으로 주변 동물약국을 검색합니다. Haversine 공식을 사용하여 거리를 계산하고, 반경 내의 약국을 거리순으로 정렬하여 반환합니다 (최대 50개).
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
 *           format: double
 *           default: 5
 *         description: 검색 반경 (km 단위, 기본값 5km)
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/VeterinaryPharmacy'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             format: double
 *                             description: 거리 (km 단위)
 *                             example: 1.5
 *       400:
 *         description: 잘못된 요청 (위도/경도 누락)
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
 *                   example: 위도와 경도를 입력해주세요.
 *       500:
 *         description: 서버 오류
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
 *                   example: 주변 약국 검색 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */


/**
 * @swagger
 * /api/pharmacies/markers:
 *   get:
 *     summary: 네이버 지도 API용 마커 데이터 조회
 *     tags: [VeterinaryPharmacy]
 *     description: 네이버 지도에 표시할 마커 데이터를 반환합니다. 주변 약국 검색 결과를 네이버 지도 마커 형식으로 변환하여 반환합니다.
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
 *           format: double
 *           default: 10
 *         description: 검색 반경 (km 단위, 기본값 10km)
 *         example: 10
 *       - in: query
 *         name: zoomLevel
 *         schema:
 *           type: number
 *           format: double
 *           default: 14
 *         description: 지도 줌 레벨 (기본값 14, 줌 레벨에 따라 자동으로 반경이 조정됩니다)
 *         example: 14
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PharmacyMarker'
 *       400:
 *         description: 잘못된 요청 (위도/경도 누락)
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
 *                   example: 위도와 경도를 입력해주세요.
 *       500:
 *         description: 서버 오류
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
 *                   example: 마커 데이터 조회 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/pharmacies/search:
 *   get:
 *     summary: 키워드로 동물약국 검색
 *     tags: [VeterinaryPharmacy]
 *     description: 약국명 또는 주소로 동물약국을 검색합니다. LIKE 검색을 사용하여 부분 일치하는 결과를 반환하며, 평점 순으로 정렬됩니다.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색 키워드 (약국명 또는 주소에 포함된 문자열)
 *         example: 강남
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 결과 개수 제한 (기본값 20, 최대 100)
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryPharmacy'
 *       400:
 *         description: 잘못된 요청 (키워드 누락)
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
 *                   example: 검색 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/pharmacies/{pharmacyId}:
 *   get:
 *     summary: 동물약국 상세 정보 조회
 *     tags: [VeterinaryPharmacy]
 *     description: 특정 동물약국의 상세 정보를 조회합니다. 사진(FacilityPhoto)과 리뷰(FacilityReview) 정보가 포함됩니다.
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 약국 고유 ID
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
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/VeterinaryPharmacy'
 *                     - type: object
 *                       properties:
 *                         photos:
 *                           type: array
 *                           description: 약국 사진 목록
 *                           items:
 *                             type: object
 *                         reviews:
 *                           type: array
 *                           description: 약국 리뷰 목록
 *                           items:
 *                             type: object
 *       404:
 *         description: 약국을 찾을 수 없음
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
 *                   example: 해당 동물약국을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
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
 *                   example: 약국 정보 조회 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/pharmacies/24hour:
 *   get:
 *     summary: 24시간 운영 약국 조회
 *     tags: [VeterinaryPharmacy]
 *     description: 24시간 운영하는 동물약국 목록을 조회합니다. 평점 순으로 정렬되어 반환됩니다.
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryPharmacy'
 *       500:
 *         description: 서버 오류
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
 *                   example: 24시간 약국 조회 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/pharmacies/top-rated:
 *   get:
 *     summary: 평점 높은 약국 조회
 *     tags: [VeterinaryPharmacy]
 *     description: 평점이 높은 동물약국 목록을 조회합니다. 최소 리뷰 5개 이상인 약국만 조회되며, 평점 순으로 정렬됩니다.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: 결과 개수 제한 (기본값 10, 최대 100)
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VeterinaryPharmacy'
 *       500:
 *         description: 서버 오류
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
 *                   example: 평점 높은 약국 조회 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */
