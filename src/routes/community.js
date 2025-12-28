const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate, authenticateOptional } = require('../middleware/auth');

/**
 * @swagger
 * /api/community/{boardType}/posts:
 *   get:
 *     summary: 게시글 목록 조회
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: boardType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [free, qna]
 *         description: 게시판 타입 (free, qna)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular, comments]
 *           default: latest
 *         description: 정렬 기준
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 위치 정보 (JSON string - {"latitude":37.5,"longitude":127.0,"radius":5})
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       500:
 *         description: 서버 오류
 */
router.get('/:boardType/posts', authenticateOptional, communityController.getPostList);

/**
 * @swagger
 * /api/community/{boardType}/posts/location:
 *   get:
 *     summary: 지역별 게시글 목록 조회
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: boardType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [free, qna]
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 5
 *         description: 검색 반경 (km)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular, comments]
 *           default: latest
 *     responses:
 *       200:
 *         description: 지역별 게시글 목록 조회 성공
 *       400:
 *         description: 위도/경도 정보 누락
 */
router.get('/:boardType/posts/location', authenticateOptional, communityController.getPostListByLocation);

/**
 * @swagger
 * /api/community/posts:
 *   post:
 *     summary: 게시글 작성
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardType
 *               - title
 *               - content
 *               - latitude
 *               - longitude
 *               - locationName
 *             properties:
 *               boardType:
 *                 type: string
 *                 enum: [free, qna]
 *                 example: free
 *               title:
 *                 type: string
 *                 example: 우리 강아지 산책 친구 구해요
 *               content:
 *                 type: string
 *                 example: 매일 저녁 6시쯤 산책하는데 같이 산책할 강아지 친구 구합니다.
 *               images:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 37.5665
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 126.9780
 *               locationName:
 *                 type: string
 *                 example: 서울특별시 중구
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 */
const upload = require('../middleware/upload');
router.post('/posts', authenticate, upload.uploadPostImages, communityController.createPost);

/**
 * @swagger
 * /api/community/posts/{postId}:
 *   get:
 *     summary: 게시글 상세 조회
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 상세 조회 성공
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.get('/posts/:postId', authenticateOptional, communityController.getPostDetail);

/**
 * @swagger
 * /api/community/posts/{postId}:
 *   put:
 *     summary: 게시글 수정
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               locationName:
 *                 type: string
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (본인의 게시글만 수정 가능)
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.put('/posts/:postId', authenticate, communityController.updatePost);

/**
 * @swagger
 * /api/community/posts/{postId}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 게시글 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (본인의 게시글만 삭제 가능)
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.delete('/posts/:postId', authenticate, communityController.deletePost);

/**
 * @swagger
 * /api/community/posts/{postId}/comments:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: 저도 같이 산책하고 싶어요!
 *               parentCommentId:
 *                 type: integer
 *                 description: 대댓글인 경우 부모 댓글 ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 게시글 또는 부모 댓글을 찾을 수 없음
 */
router.post('/posts/:postId/comments', authenticate, communityController.createComment);

/**
 * @swagger
 * /api/community/comments/{commentId}:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (본인의 댓글만 삭제 가능)
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
router.delete('/comments/:commentId', authenticate, communityController.deleteComment);

/**
 * @swagger
 * /api/community/my/comments:
 *   get:
 *     summary: 내가 작성한 댓글 목록 조회 (마이페이지)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get('/my/comments', authenticate, communityController.getUserComments);

/**
 * @swagger
 * /api/community/posts/{postId}/like:
 *   post:
 *     summary: 좋아요 추가
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 좋아요 추가 성공
 *       400:
 *         description: 이미 좋아요를 누른 게시물
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.post('/posts/:postId/like', authenticate, communityController.addLike);

/**
 * @swagger
 * /api/community/posts/{postId}/like:
 *   delete:
 *     summary: 좋아요 제거
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 좋아요 제거 성공
 *       400:
 *         description: 좋아요를 누르지 않은 게시글
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.delete('/posts/:postId/like', authenticate, communityController.removeLike);

module.exports = router;

