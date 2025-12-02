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
 *         isLateNight:
 *           type: boolean
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
 *                   example: 위도와 경도를 입력해주시요
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

