const logger = require("../utils/logger");
const communityService = require("../services/communityService");

class CommunityController {
    // 게시글 목록 조회
    async getPostList(req, res) {
        try {
            const userId = req.user?.userId || null;
            const { boardType } = req.params;
            const { page, limit, sortBy, category, location } = req.query;

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                sortBy: sortBy || 'latest',
                category,
                userId
            };

            // location이 쿼리로 전달된 경우 파싱
            if (location) {
                try {
                    options.location = JSON.parse(location);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: '위치 정보 형식이 올바르지 않습니다.'
                    });
                }
            }

            const result = await communityService.getPostList(boardType, options);

            logger.info(`Post list fetched for boardType: ${boardType}, page: ${options.page}`);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error fetching post list:', error);
            return res.status(500).json({
                success: false,
                message: '게시글 목록을 불러오는데 실패했습니다.'
            });
        }
    }

    // 지역별 게시글 목록 조회
    async getPostListByLocation(req, res) {
        try {
            const userId = req.user?.userId || null;
            const { boardType } = req.params;
            const { latitude, longitude, radius, page, limit, sortBy } = req.query;

            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: '위도와 경도 정보가 필요합니다.'
                });
            }

            const location = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: radius ? parseFloat(radius) : 5
            };

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                sortBy: sortBy || 'latest',
                userId
            };

            const result = await communityService.getPostListByLocation(boardType, location, options);

            logger.info(`Location-based post list fetched for boardType: ${boardType}`);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error fetching location-based post list:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || '지역별 게시글 목록을 불러오는데 실패했습니다.'
            });
        }
    }

    // 게시글 상세 조회
    async getPostDetail(req, res) {
        try {
            const userId = req.user?.userId || null;
            const { postId } = req.params;

            const post = await communityService.getPostDetail(postId, userId);

            logger.info(`Post detail fetched: ${postId}`);
            return res.status(200).json({
                success: true,
                data: post
            });
        } catch (error) {
            logger.error('Error fetching post detail:', error);
            return res.status(error.statusCode || 404).json({
                success: false,
                message: error.message || '게시글을 불러오는데 실패했습니다.'
            });
        }
    }

    // 게시글 작성
    async createPost(req, res) {
        try {
            const userId = req.user.userId;
            
            // 업로드된 이미지 파일 처리
            const imageUrls = [];
            if (req.files && req.files.length > 0) {
                logger.info(`이미지 파일 ${req.files.length}개 업로드됨`);
                req.files.forEach(file => {
                    // 이미지 URL 생성 (서버 호스트 + 경로)
                    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/community/${file.filename}`;
                    imageUrls.push(imageUrl);
                    logger.info(`이미지 URL 생성: ${imageUrl}`);
                });
            } else {
                logger.info('업로드된 이미지 파일 없음');
            }

            // req.body.images가 문자열인 경우 처리 (FormData에서 배열이 문자열로 전달될 수 있음)
            let bodyImages = [];
            if (req.body.images) {
                if (Array.isArray(req.body.images)) {
                    bodyImages = req.body.images;
                } else if (typeof req.body.images === 'string') {
                    try {
                        bodyImages = JSON.parse(req.body.images);
                    } catch (e) {
                        bodyImages = [];
                    }
                }
            }

            const finalImages = imageUrls.length > 0 ? imageUrls : bodyImages;
            logger.info(`최종 이미지 개수: ${finalImages.length}`);

            const postData = {
                ...req.body,
                images: finalImages
            };

            const result = await communityService.createdPost(userId, postData);

            logger.info(`Post created successfully: ${result.postId} by user ${userId}`);
            return res.status(201).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            logger.error('Error creating post:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '게시글 작성에 실패했습니다.'
            });
        }
    }

    // 게시글 수정
    async updatePost(req, res) {
        try {
            const userId = req.user.userId;
            const { postId } = req.params;
            const postData = req.body;

            const result = await communityService.updatePost(postId, userId, postData);

            logger.info(`Post updated successfully: ${postId}`);
            return res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            logger.error('Error updating post:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '게시글 수정에 실패했습니다.'
            });
        }
    }

    // 게시글 삭제
    async deletePost(req, res) {
        try {
            const userId = req.user.userId;
            const { postId } = req.params;

            const result = await communityService.deletePost(postId, userId);

            logger.info(`Post deleted successfully: ${postId}`);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            logger.error('Error deleting post:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '게시글 삭제에 실패했습니다.'
            });
        }
    }

    // 댓글 작성
    async createComment(req, res) {
        try {
            const userId = req.user.userId;
            const { postId } = req.params;
            const commentData = {
                ...req.body,
                postId: parseInt(postId)
            };

            const result = await communityService.createComment(postId, userId, commentData);

            logger.info(`Comment created successfully: ${result.commentId} on post ${postId}`);
            return res.status(201).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            logger.error('Error creating comment:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '댓글 작성에 실패했습니다.'
            });
        }
    }

    // 댓글 삭제
    async deleteComment(req, res) {
        try {
            const userId = req.user.userId;
            const { commentId } = req.params;

            const result = await communityService.deleteComment(commentId, userId);

            logger.info(`Comment deleted successfully: ${commentId}`);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            logger.error('Error deleting comment:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '댓글 삭제에 실패했습니다.'
            });
        }
    }

    // 사용자 댓글 목록 조회 (마이페이지용)
    async getUserComments(req, res) {
        try {
            const userId = req.user.userId;
            const { page, limit } = req.query;

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20
            };

            const result = await communityService.getUserComments(userId, options);

            logger.info(`User comments fetched for user: ${userId}`);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error fetching user comments:', error);
            return res.status(500).json({
                success: false,
                message: '댓글 목록을 불러오는데 실패했습니다.'
            });
        }
    }

    // 좋아요 추가
    async addLike(req, res) {
        try {
            const userId = req.user.userId;
            const { postId } = req.params;

            const result = await communityService.addLike(postId, userId);

            logger.info(`Like added to post: ${postId} by user ${userId}`);
            return res.status(200).json({
                success: true,
                data: { likeCount: result.likeCount },
                message: result.message
            });
        } catch (error) {
            logger.error('Error adding like:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '좋아요 추가에 실패했습니다.'
            });
        }
    }

    // 좋아요 제거
    async removeLike(req, res) {
        try {
            const userId = req.user.userId;
            const { postId } = req.params;

            const result = await communityService.removeLike(postId, userId);

            logger.info(`Like removed from post: ${postId} by user ${userId}`);
            return res.status(200).json({
                success: true,
                data: { likeCount: result.likeCount },
                message: result.message
            });
        } catch (error) {
            logger.error('Error removing like:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || '좋아요 제거에 실패했습니다.'
            });
        }
    }
}

module.exports = new CommunityController();