const healthRecordService = require('../services/HealthRecord');
const logger = require('../utils/logger');

class HealthRecordController {
  /**
   * 건강 기록 생성
   * POST /api/health/records
   */
  async createHealthRecord(req, res) {
    try {
      const userId = req.user.userId;
      const {
        petId,
        recordDate,
        recordType,
        mealAmount,
        waterAmount,
        urineColor,
        fecesConsistency,
        fecesColor,
        fecesPhotoUrl,
        activityMinutes,
        weightKg,
        symptoms,
        symptomPhotoUrls,
        memo
      } = req.body;

      if (!petId || !recordDate || !recordType) {
        return res.status(400).json({
          success: false,
          message: 'petId, recordDate, recordType는 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.createHealthRecord(
        petId,
        userId,
        recordDate,
        recordType,
        mealAmount,
        waterAmount,
        urineColor,
        fecesConsistency,
        fecesColor,
        fecesPhotoUrl,
        activityMinutes,
        weightKg,
        symptoms,
        symptomPhotoUrls,
        memo
      );

      logger.info(`Health record created: recordId=${healthRecord.recordId} for petId=${petId}`);
      
      return res.status(201).json({
        success: true,
        data: healthRecord,
        message: '건강 기록이 등록되었습니다.'
      });
    } catch (error) {
      logger.error('Error creating health record:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '건강 기록 등록에 실패했습니다.'
      });
    }
  }

  /**
   * 건강 기록 수정
   * PUT /api/health/records/:recordId
   */
  async updateHealthRecord(req, res) {
    try {
      const userId = req.user.userId;
      const { recordId } = req.params;
      const {
        petId,
        recordDate,
        recordType,
        mealAmount,
        waterAmount,
        urineColor,
        fecesConsistency,
        fecesColor,
        fecesPhotoUrl,
        activityMinutes,
        weightKg,
        symptoms,
        symptomPhotoUrls,
        memo
      } = req.body;

      if (!petId) {
        return res.status(400).json({
          success: false,
          message: 'petId는 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.updateHealthRecord(
        recordId,
        petId,
        userId,
        recordDate,
        recordType,
        mealAmount,
        waterAmount,
        urineColor,
        fecesConsistency,
        fecesColor,
        fecesPhotoUrl,
        activityMinutes,
        weightKg,
        symptoms,
        symptomPhotoUrls,
        memo
      );

      logger.info(`Health record updated: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        data: healthRecord,
        message: '건강 기록이 수정되었습니다.'
      });
    } catch (error) {
      logger.error('Error updating health record:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '건강 기록 수정에 실패했습니다.'
      });
    }
  }

  /**
   * 건강 기록 삭제
   * DELETE /api/health/records/:recordId
   */
  async deleteHealthRecord(req, res) {
    try {
      const { recordId } = req.params;

      await healthRecordService.deleteHealthRecord(recordId);

      logger.info(`Health record deleted: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        message: '건강 기록이 삭제되었습니다.'
      });
    } catch (error) {
      logger.error('Error deleting health record:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '건강 기록 삭제에 실패했습니다.'
      });
    }
  }

  /**
   * 배변 사진 저장/업데이트
   * PUT /api/health/records/:recordId/feces-photo
   */
  async saveFecesPhoto(req, res) {
    try {
      const userId = req.user.userId;
      const { recordId } = req.params;
      const { petId, photoUrl } = req.body;

      if (!petId || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: 'petId와 photoUrl은 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.saveFecesPhoto(
        recordId,
        petId,
        userId,
        photoUrl
      );

      logger.info(`Feces photo saved: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        data: healthRecord,
        message: '배변 사진이 저장되었습니다.'
      });
    } catch (error) {
      logger.error('Error saving feces photo:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '배변 사진 저장에 실패했습니다.'
      });
    }
  }

  /**
   * 증상 사진 추가
   * POST /api/health/records/:recordId/symptom-photos
   */
  async addSymptomPhoto(req, res) {
    try {
      const userId = req.user.userId;
      const { recordId } = req.params;
      const { petId, photoUrl } = req.body;

      if (!petId || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: 'petId와 photoUrl은 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.addSymptomPhoto(
        recordId,
        petId,
        userId,
        photoUrl
      );

      logger.info(`Symptom photo added: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        data: healthRecord,
        message: '증상 사진이 추가되었습니다.'
      });
    } catch (error) {
      logger.error('Error adding symptom photo:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '증상 사진 추가에 실패했습니다.'
      });
    }
  }

  /**
   * 증상 사진 삭제
   * DELETE /api/health/records/:recordId/symptom-photos
   */
  async removeSymptomPhoto(req, res) {
    try {
      const userId = req.user.userId;
      const { recordId } = req.params;
      const { petId, photoUrl } = req.body;

      if (!petId || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: 'petId와 photoUrl은 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.removeSymptomPhoto(
        recordId,
        petId,
        userId,
        photoUrl
      );

      logger.info(`Symptom photo removed: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        data: healthRecord,
        message: '증상 사진이 삭제되었습니다.'
      });
    } catch (error) {
      logger.error('Error removing symptom photo:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '증상 사진 삭제에 실패했습니다.'
      });
    }
  }

  /**
   * 증상 사진 전체 교체
   * PUT /api/health/records/:recordId/symptom-photos
   */
  async updateSymptomPhotos(req, res) {
    try {
      const userId = req.user.userId;
      const { recordId } = req.params;
      const { petId, photoUrls } = req.body;

      if (!petId) {
        return res.status(400).json({
          success: false,
          message: 'petId는 필수입니다.'
        });
      }

      const healthRecord = await healthRecordService.updateSymptomPhotos(
        recordId,
        petId,
        userId,
        photoUrls
      );

      logger.info(`Symptom photos updated: recordId=${recordId}`);
      
      return res.status(200).json({
        success: true,
        data: healthRecord,
        message: '증상 사진이 업데이트되었습니다.'
      });
    } catch (error) {
      logger.error('Error updating symptom photos:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '증상 사진 업데이트에 실패했습니다.'
      });
    }
  }
}

module.exports = new HealthRecordController();

