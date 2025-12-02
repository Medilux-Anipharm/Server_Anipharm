const NaverMapService = require('../services/naverMapService');
const logger = require('../utils/logger');

const naverMapService = new NaverMapService();

class MapController {
  /**
   * 주소를 좌표로 변환 (Geocoding)
   * GET /api/map/geocode
   */
  async geocode(req, res) {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ error: '주소 파라미터가 필요합니다.' });
      }

      const result = await naverMapService.geocode(address);
      res.json(result);
    } catch (error) {
      logger.error('Geocoding 오류:', error);
      res.status(500).json({ 
        error: error.message || '주소 변환 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * 카테고리별 장소 검색
   * GET /api/map/search
   */
  async search(req, res) {
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
      logger.error('장소 검색 오류:', error);
      res.status(500).json({ 
        error: error.message || '장소 검색 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * 사용자 위치 저장
   * POST /api/map/location
   */
  async saveLocation(req, res) {
    try {
      const { latitude, longitude, userId } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: '위도와 경도가 필요합니다.' });
      }

      // 위치 정보 로깅 (나중에 DB에 저장할 수 있음)
      logger.info('사용자 위치 수신:', {
        userId: userId || 'anonymous',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date().toISOString()
      });

      // TODO: 필요시 DB에 사용자 위치 저장
      // await User.update(
      //   { lastLatitude: latitude, lastLongitude: longitude },
      //   { where: { id: userId } }
      // );

      res.json({
        success: true,
        message: '위치가 성공적으로 조회되었습니다.',
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });
    } catch (error) {
      logger.error('위치 저장 오류:', error);
      res.status(500).json({ 
        error: error.message || '위치 저장 중 오류가 발생했습니다.' 
      });
    }
  }
}

module.exports = new MapController();

