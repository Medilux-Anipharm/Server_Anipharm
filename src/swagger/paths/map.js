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



/**
 * @swagger
 * /api/map/search:
 *   get:
 *     summary: 지역 검색
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         description: 검색할 카테고리
 *         example: hospital
 *       - in: query
 *         name: region
 *         required: false
 *         description: 검색할 지역
 *         example: 서울특별시
 *       - in: query
 *         name: latitude
 *         required: false
 *         description: 검색할 위도
 *         example: 37.5012
 *       - in: query
 *         name: longitude
 *         required: false
 *         description: 검색할 경도
 *         example: 127.0386
 *       - in: query
 *         name: display
 *         required: false
 *         description: 검색 결과 표시 개수
 *         example: 10
 *       - in: query
 *         name: start
 *         required: false
 *         description: 검색 결과 시작 위치
 *         example: 1
 *     responses:
 *       200:
 *         description: 장소 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: https://map.naver.com/p/entry/place/1234567890
 *                   name:
 *                     type: string
 *                     example: 서울특별시 강남구 테헤란로 152
 *                   category:
 *                     type: string
 *                     example: 병원
 *                   address:
 *                     type: string     
 *                     example: 서울특별시 강남구 테헤란로 152
 *                   roadAddress:
 *                     type: string
 *                     example: 서울특별시 강남구 테헤란로 152
 *                   telephone:
 *                     type: string
 *                     example: 02-1234-5678
 *                   latitude:
 *                     type: number
 *                     example: 37.5012
 *                   longitude:
 *                     type: number
 *                     example: 127.0386
 *                   description:
 *                     type: string
 *                     example: 24시간 진료 가능
 *                   link:
 *                     type: string
 *                     example: https://map.naver.com/p/entry/place/1234567890
 *       400:
 *         description: 잘못된 요청 (카테고리 파라미터 누락 또는 지원하지 않는 카테고리)
 *       500:
 *         description: 서버 오류
 */ 