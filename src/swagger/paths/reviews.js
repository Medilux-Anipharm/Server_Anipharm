/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 약국/병원 리뷰 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         reviewId:
 *           type: integer
 *           description: 리뷰 고유 ID
 *           example: 1
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 별점 (1-5)
 *           example: 5
 *         content:
 *           type: string
 *           description: 리뷰 내용
 *           example: "정말 친절하고 좋았어요!"
 *         author:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               example: 123
 *             nickname:
 *               type: string
 *               example: "반려인홍길동"
 *             profileImageURL:
 *               type: string
 *               nullable: true
 *               example: "https://example.com/profile.jpg"
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *           description: 리뷰 키워드
 *           example: ["친절해요", "깨끗해요", "전문적이에요"]
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               mediaId:
 *                 type: integer
 *                 example: 1
 *               mediaUrl:
 *                 type: string
 *                 example: "/uploads/reviews/review-123456789.jpg"
 *               mediaType:
 *                 type: string
 *                 enum: [image, video]
 *                 example: "image"
 *         likeCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 15
 *         isLiked:
 *           type: boolean
 *           description: 현재 사용자의 좋아요 여부
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 작성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *
 *     ReviewSummary:
 *       type: object
 *       properties:
 *         averageRating:
 *           type: number
 *           format: float
 *           description: 평균 평점
 *           example: 4.5
 *         totalReviews:
 *           type: integer
 *           description: 전체 리뷰 수
 *           example: 128
 *         ratingDistribution:
 *           type: object
 *           properties:
 *             5:
 *               type: integer
 *               example: 80
 *             4:
 *               type: integer
 *               example: 30
 *             3:
 *               type: integer
 *               example: 10
 *             2:
 *               type: integer
 *               example: 5
 *             1:
 *               type: integer
 *               example: 3
 *         keywordSummary:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               keyword:
 *                 type: string
 *                 example: "친절해요"
 *               count:
 *                 type: integer
 *                 example: 45
 *               percentage:
 *                 type: number
 *                 format: float
 *                 example: 35.2
 */

/**
 * @swagger
 * /api/reviews/pharmacies/{pharmacyId}:
 *   get:
 *     summary: 약국 리뷰 목록 조회
 *     tags: [Reviews]
 *     description: 특정 약국의 리뷰 목록을 조회합니다. 정렬, 페이징, 필터링이 가능합니다.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 약국 ID
 *         example: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular, rating]
 *           default: latest
 *         description: 정렬 기준 (latest-최신순, popular-인기순, rating-평점순)
 *         example: latest
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: 페이지당 리뷰 수
 *         example: 20
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 최소 별점 필터
 *         example: 4
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 키워드 필터
 *         example: "친절해요"
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
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 200
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 20
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
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
 *                   example: "약국ID 또는 병원ID가 필요합니다."
 */

/**
 * @swagger
 * /api/reviews/hospitals/{hospitalId}:
 *   get:
 *     summary: 병원 리뷰 목록 조회
 *     tags: [Reviews]
 *     description: 특정 병원의 리뷰 목록을 조회합니다. 정렬, 페이징, 필터링이 가능합니다.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 병원 ID
 *         example: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular, rating]
 *           default: latest
 *         description: 정렬 기준
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: 페이지당 리뷰 수
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 최소 별점 필터
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 키워드 필터
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
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     pagination:
 *                       type: object
 */

/**
 * @swagger
 * /api/reviews/pharmacies/{pharmacyId}/summary:
 *   get:
 *     summary: 약국 리뷰 요약 조회
 *     tags: [Reviews]
 *     description: 약국의 평균 평점, 별점 분포, 인기 키워드 등을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 약국 ID
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
 *                   $ref: '#/components/schemas/ReviewSummary'
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/reviews/hospitals/{hospitalId}/summary:
 *   get:
 *     summary: 병원 리뷰 요약 조회
 *     tags: [Reviews]
 *     description: 병원의 평균 평점, 별점 분포, 인기 키워드 등을 조회합니다.
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReviewSummary'
 */

/**
 * @swagger
 * /api/reviews/pharmacies/{pharmacyId}:
 *   post:
 *     summary: 약국 리뷰 작성
 *     tags: [Reviews]
 *     description: 약국에 대한 리뷰를 작성합니다. 별점, 내용, 키워드, 미디어 파일을 포함할 수 있습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 약국 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 별점 (1-5)
 *                 example: 5
 *               content:
 *                 type: string
 *                 description: 리뷰 내용
 *                 example: "친절하고 전문적이었어요!"
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 리뷰 키워드 (배열)
 *                 example: ["친절해요", "깨끗해요"]
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 미디어 파일 (이미지/비디오, 최대 5개, 각 50MB)
 *     responses:
 *       201:
 *         description: 리뷰 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *                 message:
 *                   type: string
 *                   example: "리뷰가 성공적으로 작성되었습니다."
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
 *                   example: "별점은 1 ~ 5 사이의 값이어야 합니다."
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/reviews/hospitals/{hospitalId}:
 *   post:
 *     summary: 병원 리뷰 작성
 *     tags: [Reviews]
 *     description: 병원에 대한 리뷰를 작성합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 병원 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 별점 (1-5)
 *               content:
 *                 type: string
 *                 description: 리뷰 내용
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 리뷰 키워드
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 미디어 파일
 *     responses:
 *       201:
 *         description: 리뷰 작성 성공
 */

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   get:
 *     summary: 리뷰 상세 조회
 *     tags: [Reviews]
 *     description: 특정 리뷰의 상세 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰 ID
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
 *                     - $ref: '#/components/schemas/Review'
 *                     - type: object
 *                       properties:
 *                         target:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               enum: [pharmacy, hospital]
 *                               example: "pharmacy"
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "강남 동물약국"
 *                             address:
 *                               type: string
 *                               example: "서울시 강남구..."
 *       400:
 *         description: 리뷰를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 *   put:
 *     summary: 리뷰 수정
 *     tags: [Reviews]
 *     description: 자신이 작성한 리뷰를 수정합니다. 부분 수정이 가능합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰 ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 별점 (선택)
 *               content:
 *                 type: string
 *                 description: 리뷰 내용 (선택)
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 리뷰 키워드 (선택)
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 추가할 미디어 파일 (선택)
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *                 message:
 *                   type: string
 *                   example: "리뷰가 성공적으로 수정되었습니다."
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (본인 리뷰가 아님)
 *       500:
 *         description: 서버 오류
 *   delete:
 *     summary: 리뷰 삭제
 *     tags: [Reviews]
 *     description: 자신이 작성한 리뷰를 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
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
 *                   example: "리뷰가 성공적으로 삭제되었습니다."
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/reviews/{reviewId}/like:
 *   post:
 *     summary: 리뷰 좋아요 추가
 *     tags: [Reviews]
 *     description: 리뷰에 좋아요를 추가합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 좋아요 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     likeCount:
 *                       type: integer
 *                       example: 16
 *                 message:
 *                   type: string
 *                   example: "좋아요를 눌렀습니다."
 *       400:
 *         description: 이미 좋아요를 누른 리뷰
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
 *                   example: "이미 좋아요를 누른 리뷰입니다"
 *       401:
 *         description: 인증 필요
 *   delete:
 *     summary: 리뷰 좋아요 취소
 *     tags: [Reviews]
 *     description: 리뷰의 좋아요를 취소합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰 ID
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     likeCount:
 *                       type: integer
 *                       example: 15
 *                 message:
 *                   type: string
 *                   example: "좋아요를 취소했습니다."
 *       400:
 *         description: 좋아요를 누르지 않은 리뷰
 *       401:
 *         description: 인증 필요
 */
