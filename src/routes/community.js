const express = require('express');
const router = express.Router();

// TODO: 커뮤니티 관련 라우트 구현
// GET /api/community/posts - 게시글 목록 조회
// POST /api/community/posts - 게시글 작성
// GET /api/community/posts/:postId - 게시글 상세 조회
// PUT /api/community/posts/:postId - 게시글 수정
// DELETE /api/community/posts/:postId - 게시글 삭제
// POST /api/community/posts/:postId/like - 좋아요
// POST /api/community/posts/:postId/scrap - 스크랩
// POST /api/community/posts/:postId/comments - 댓글 작성

router.get('/', (req, res) => {
  res.json({ message: 'Community routes' });
});

module.exports = router;

