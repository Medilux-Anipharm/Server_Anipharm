const express = require('express');
const router = express.Router();
const NaverMapService = require('../services/naverMapService');

const naverMapService = new NaverMapService();

/**
 * @swagger
 * /api/map/geocode:
 *   get:
 *     summary: 주소를 좌표로 변환 (Geocoding)
 *     tags: [Map]
 *     description: 주소 문자열을 위도/경도 좌표로 변환합니다.
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: 변환할 주소
 *         example: "서울특별시 강남구 테헤란로 152"
 *     responses:
 *       200:
 *         description: 좌표 변환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   description: 위도 (y좌표)
 *                   example: 37.5012
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   description: 경도 (x좌표)
 *                   example: 127.0395
 *                 roadAddress:
 *                   type: string
 *                   description: 도로명 주소
 *                   example: "서울특별시 강남구 테헤란로 152"
 *                 jibunAddress:
 *                   type: string
 *                   description: 지번 주소
 *                   example: "서울특별시 강남구 역삼동 737"
 *       400:
 *         description: 잘못된 요청 (주소 파라미터 누락)
 *       404:
 *         description: 주소를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: '주소 파라미터가 필요합니다.' });
    }

    const result = await naverMapService.geocode(address);
    res.json(result);
  } catch (error) {
    console.error('Geocoding 오류:', error);
    res.status(500).json({ error: error.message || '주소 변환 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/map/search:
 *   get:
 *     summary: 카테고리별 장소 검색
 *     tags: [Map]
 *     description: 카테고리와 옵션에 따라 장소를 검색하고, 좌표가 제공되면 거리순으로 정렬합니다.
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [hospital, pharmacy, petshop, hotel, grooming]
 *         description: 검색할 카테고리
 *         example: hospital
 *       - in: query
 *         name: region
 *         required: false
 *         schema:
 *           type: string
 *         description: 검색할 지역 (예: "서울", "강남구")
 *         example: "서울"
 *       - in: query
 *         name: latitude
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: 기준점 위도 (좌표 기반 정렬 시 사용)
 *         example: 37.5012
 *       - in: query
 *         name: longitude
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: 기준점 경도 (좌표 기반 정렬 시 사용)
 *         example: 127.0395
 *       - in: query
 *         name: display
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 검색 결과 개수
 *         example: 20
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 검색 시작 위치 (페이지네이션)
 *         example: 1
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 장소 고유 ID (링크)
 *                     example: "https://..."
 *                   name:
 *                     type: string
 *                     description: 장소명
 *                     example: "강남동물병원"
 *                   category:
 *                     type: string
 *                     description: 카테고리
 *                     example: "동물병원"
 *                   address:
 *                     type: string
 *                     description: 주소
 *                     example: "서울특별시 강남구..."
 *                   roadAddress:
 *                     type: string
 *                     description: 도로명 주소
 *                     example: "서울특별시 강남구 테헤란로..."
 *                   telephone:
 *                     type: string
 *                     description: 전화번호
 *                     example: "02-1234-5678"
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     nullable: true
 *                     description: 위도
 *                     example: 37.5012
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     nullable: true
 *                     description: 경도
 *                     example: 127.0395
 *                   description:
 *                     type: string
 *                     description: 장소 설명
 *                     example: "24시간 진료 가능"
 *                   link:
 *                     type: string
 *                     description: 상세 정보 링크
 *                     example: "https://..."
 *       400:
 *         description: 잘못된 요청 (카테고리 파라미터 누락 또는 지원하지 않는 카테고리)
 *       500:
 *         description: 서버 오류
 */
router.get('/search', async (req, res) => {
  try {
    const { category, region, latitude, longitude, display, start } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: '카테고리 파라미터가 필요합니다.' });
    }

    const options = {};
    if (region) options.region = region;
    if (latitude) options.latitude = parseFloat(latitude);
    if (longitude) options.longitude = parseFloat(longitude);
    if (display) options.display = parseInt(display);
    if (start) options.start = parseInt(start);

    const places = await naverMapService.searchByCategory(category, options);
    res.json(places);
  } catch (error) {
    console.error('장소 검색 오류:', error);
    res.status(500).json({ error: error.message || '장소 검색 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

