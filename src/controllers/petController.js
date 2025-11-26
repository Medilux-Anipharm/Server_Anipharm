const petService = require('../services/petService');
const logger = require('../utils/logger');

class PetController {
  async createPet(req, res) {
    try {
      const userId = req.user.userId;
      const petData = req.body;

      const pet = await petService.createPet(userId, petData);

      logger.info(`Pet created successfully: ${pet.petId} for user ${userId}`);
      return res.status(201).json({
        success: true,
        data: pet,
        message: '반려동물이 등록되었습니다.'
      });
    } catch (error) {
      logger.error('Error creating pet:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPets(req, res) {
    try {
      const userId = req.user.userId;
      const pets = await petService.getPetsByUserId(userId);

      return res.status(200).json({
        success: true,
        data: pets
      });
    } catch (error) {
      logger.error('Error fetching pets:', error);
      return res.status(500).json({
        success: false,
        message: '반려동물 목록을 불러오는데 실패했습니다.'
      });
    }
  }

  async getPet(req, res) {
    try {
      const { petId } = req.params;
      const userId = req.user.userId;

      const pet = await petService.getPetById(petId);

      if (pet.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      return res.status(200).json({
        success: true,
        data: pet
      });
    } catch (error) {
      logger.error('Error fetching pet:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePet(req, res) {
    try {
      const { petId } = req.params;
      const userId = req.user.userId;
      const petData = req.body;

      const pet = await petService.updatePet(petId, userId, petData);

      logger.info(`Pet updated successfully: ${petId}`);
      return res.status(200).json({
        success: true,
        data: pet,
        message: '반려동물 정보가 수정되었습니다.'
      });
    } catch (error) {
      logger.error('Error updating pet:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletePet(req, res) {
    try {
      const { petId } = req.params;
      const userId = req.user.userId;

      const result = await petService.deletePet(petId, userId);

      logger.info(`Pet deleted successfully: ${petId}`);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error deleting pet:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async setPrimaryPet(req, res) {
    try {
      const { petId } = req.params;
      const userId = req.user.userId;

      const pet = await petService.setPrimaryPet(petId, userId);

      logger.info(`Primary pet set successfully: ${petId}`);
      return res.status(200).json({
        success: true,
        data: pet,
        message: '대표 반려동물이 설정되었습니다.'
      });
    } catch (error) {
      logger.error('Error setting primary pet:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PetController();
