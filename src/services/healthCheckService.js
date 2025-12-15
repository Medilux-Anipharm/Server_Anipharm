const { HealthCheck } = require('../models');

class HealthCheckService {
    async createHealthCheck(petId, userId, concernType, appetite, activity, temperature, note) {
        try {
            const healthCheck = await HealthCheck.create({ petId, userId, concernType, appetite, activity, temperature, note });
            return healthCheck;
        } catch (error) {
            console.error('건강체크 생성 오류:', error);
            throw error;
        }
    }

    async getHealthCheckById(healthCheckId) {
        try {
            const healthCheck = await HealthCheck.findByPk(healthCheckId);
            if(!healthCheck){
                throw new Error('건강체크표를 찾을 수 없습니다.')
            }
            return healthCheck;
        }catch (error) {
            console.error('건강체크표 조회 오류:', error);
            throw error;
        }
    }
    
}
module.exports = new HealthCheckService();