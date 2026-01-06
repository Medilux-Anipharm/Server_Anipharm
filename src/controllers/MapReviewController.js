const logger = require('../utils/logger')
const reviewService = require('../services/mapReviewService')
const { log } = require('winston')

class ReviewController {
  async getReviewList(req, res) {
    try {
      const userId = req.user?.userId || null;
      const { pharmacyId, hospitalId } = req.params;
      const { sortBy, page, limit, minRating, keyword } = req.query;

      let targetType, targetId;
      if (pharmacyId) {
        targetType = "pharmacy";
        targetId = parseInt(pharmacyId);
      } else if (hospitalId) {
        targetType = "hospital";
        targetId = parseInt(hospitalId);
      } else {
        return res.status(400).json({
          success: false,
          message: "약국ID 또는 병원ID가 필요합니다.",
        });
      }
      const options = {
        sortBy: sortBy || "latest",
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        userId: userId,
      };

      if (minRating) {
        const rating = parseInt(minRating);
        if (rating >= 1 && rating <= 5) {
          options.minRating = rating;
        }
      }

      if (keyword) {
        options.keyword = keyword;
      }

      const result = await reviewService.getReviewList(
        targetType,
        targetId,
        options
      );
      logger.info(
        `리뷰를 가져왔습니다 ${targetType}|${targetId}, page : ${options.page}`
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("리뷰 가져오기 실패했습니다", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } // end getReviewList

  async getReviewSummary(req, res) {
    const { pharmacyId, hospitalId } = req.params;
    let targetId, targetType;
    
    try {
      logger.info(`[리뷰 요약 요청] pharmacyId: ${pharmacyId}, hospitalId: ${hospitalId}`);
      
      if (pharmacyId) {
        targetType = "pharmacy";
        targetId = parseInt(pharmacyId);
      } else if (hospitalId) {
        targetType = "hospital";
        targetId = parseInt(hospitalId);
      } else {
        logger.error(`[리뷰 요약] 파라미터 오류: pharmacyId=${pharmacyId}, hospitalId=${hospitalId}`);
        throw new Error("찾을 수 없습니다");
      }

      logger.info(`[리뷰 요약] 타입: ${targetType}, ID: ${targetId}`);
      const result = await reviewService.getReviewSummary(targetType, targetId);
      
      logger.info(`[리뷰 요약 성공] ${targetType} | ${targetId} | 평균: ${result.averageRating}, 총: ${result.totalReviews}`);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`[리뷰 요약 실패] 타입: ${targetType}, ID: ${targetId}`);
      logger.error(`[리뷰 요약 에러] 메시지: ${error.message}`);
      logger.error(`[리뷰 요약 에러] 스택: ${error.stack}`);
      logger.error(`[리뷰 요약 에러] 전체 에러 객체:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      return res.status(500).json({
        success: false,
        message: "리뷰요약을 찾을 수 없습니다.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  } // end getReviewSummary

  async getReviewDetail(req, res) {
    try {
      const userId = req.user?.userId || null;
      const { reviewId } = req.params;

      const review = await reviewService.getReviewDetail(
        parseInt(reviewId),
        userId
      );

      logger.info("리뷰 디테일 조회 완 : ", reviewId);
      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      logger.error("리뷰 디테일 조회 실패 : ", error),
        logger.error(
          "이걸 보는 상지야. 혹은 나야.. 개발자가 구려서 이런 에러를 보게 되었구나.. 파이팅이란다. 새해복 많이 받으렴.."
        );
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } // end getReviewDetail
  async createReview(req, res) {
    try {
      const userId = req.user.userId;
      const { pharmacyId, hospitalId } = req.params;
      const { rating, content, keywords } = req.body;
      const mediaFiles = req.files || [];

      let targetType, targetId;
      if (pharmacyId) {
        targetType = "pharmacy";
        targetId = parseInt(pharmacyId);
      } else if (hospitalId) {
        targetType = "hospital";
        targetId = parseInt(hospitalId);
      } else {
        return res.status(400).json({
          success: false,
          message: "약국 또는 병원 ID가 필요합니다.",
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "별점은 1 ~ 5 사이의 값이어야 합니다.",
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "리뷰 내용을 입력해주세요.",
        });
      }

      const reviewData = {
        targetType,
        targetId,
        rating: parseInt(rating),
        content,
      };

      const keywordsArray = keywords
        ? Array.isArray(keywords)
          ? keywords
          : [keywords]
        : [];

      const review = await reviewService.createReview(
        userId,
        reviewData,
        keywordsArray,
        mediaFiles
      );

      logger.info(`리뷰 생성 완료: ${review.reviewId} by user ${userId}`);

      return res.status(201).json({
        success: true,
        data: review,
        message: "리뷰가 성공적으로 작성되었습니다.",
      });
    } catch (error) {
      logger.error("리뷰 생성 실패:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "리뷰 작성에 실패했습니다.",
      });
    }
  } // end createReview

  async updateReview(req, res) {
    try {
      const userId = req.user.userId;
      const { reviewId } = req.params;
      const { rating, content, keywords } = req.body;
      const mediaFiles = req.files || [];

      const reviewData = {};
      if (rating !== undefined) {
        const ratingNum = parseInt(rating);
        if (ratingNum < 1 || ratingNum > 5) {
          return res.status(400).json({
            success: false,
            message: "별점은 1 ~ 5 사이의 값이어야 합니다.",
          });
        }
        reviewData.rating = ratingNum;
      }

      if (content !== undefined) {
        if (content.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: "리뷰 내용을 입력해주세요.",
          });
        }
        reviewData.content = content;
      }

      const keywordsArray = keywords
        ? Array.isArray(keywords)
          ? keywords
          : [keywords]
        : [];

      const updatedReview = await reviewService.updateReview(
        parseInt(reviewId),
        userId,
        reviewData,
        keywordsArray,
        mediaFiles
      );

      logger.info(`리뷰 수정 완료: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        data: updatedReview,
        message: "리뷰가 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      logger.error("리뷰 수정 실패:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "리뷰 수정에 실패했습니다.",
      });
    }
  } // end updateReview

  async deleteReview(req, res) {
    try {
      const userId = req.user.userId;
      const { reviewId } = req.params;

      await reviewService.deleteReview(parseInt(reviewId), userId);

      logger.info(`리뷰 삭제 완료: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: "리뷰가 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      logger.error("리뷰 삭제 실패:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "리뷰 삭제에 실패했습니다.",
      });
    }
  } // end deleteReview

  async addLike(req, res) {
    try {
      const userId = req.user.userId;
      const { reviewId } = req.params;

      const result = await reviewService.addLike(parseInt(reviewId), userId);

      logger.info(`리뷰 좋아요 추가: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        data: result,
        message: "좋아요를 눌렀습니다.",
      });
    } catch (error) {
      logger.error("좋아요 추가 실패:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "좋아요 추가에 실패했습니다.",
      });
    }
  } // end addLike

  async removeLike(req, res) {
    try {
      const userId = req.user.userId;
      const { reviewId } = req.params;

      const result = await reviewService.removeLike(parseInt(reviewId), userId);

      logger.info(`리뷰 좋아요 취소: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        data: result,
        message: "좋아요를 취소했습니다.",
      });
    } catch (error) {
      logger.error("좋아요 취소 실패:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "좋아요 취소에 실패했습니다.",
      });
    }
  } // end removeLike
} // end ReviewController

module.exports = new ReviewController();