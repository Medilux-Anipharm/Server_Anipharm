/**
 * 동물병원 컨트롤러
 */

const veterinaryHospitalService = require('../services/veterinaryHospitalService');

/**
 * CSV 데이터 import (관리자용)
 */
exports.importCSVData = async (req, res) => {
  try {
    const result = await veterinaryHospitalService.importFromCSV();

    res.status(200).json({
      success: true,
      message: '동물병원 데이터를 성공적으로 저장했습니다.',
      data: result
    });
  } catch (error) {
    console.error('CSV import 오류:', error);
    res.status(500).json({
      success: false,
      message: 'CSV 데이터 import 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 주변 동물병원 검색
 */
exports.findNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '위도와 경도를 입력해주세요.'
      });
    }

    const hospitals = await veterinaryHospitalService.findNearbyHospitals(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );

    res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('주변 병원 검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '주변 병원 검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 키워드 검색
 */
exports.searchByKeyword = async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }

    const hospitals = await veterinaryHospitalService.searchByKeyword(keyword, limit);

    res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('키워드 검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 동물병원 상세 정보 조회
 */
exports.getDetail = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await veterinaryHospitalService.getHospitalDetail(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: '해당 동물병원을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('병원 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '병원 정보 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 네이버 지도 API용 마커 데이터 조회
 */
exports.getMapMarkers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, zoomLevel } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '위도와 경도를 입력해주세요.'
      });
    }

    const markers = await veterinaryHospitalService.getMarkersForMap(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : undefined,
      zoomLevel ? parseFloat(zoomLevel) : undefined
    );

    res.status(200).json({
      success: true,
      data: markers
    });
  } catch (error) {
    console.error('마커 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '마커 데이터 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 24시간 운영 병원 조회
 */
exports.get24HourHospitals = async (req, res) => {
  try {
    const hospitals = await veterinaryHospitalService.get24HourHospitals();

    res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('24시간 병원 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '24시간 병원 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

/**
 * 평점 높은 병원 조회
 */
exports.getTopRated = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const hospitals = await veterinaryHospitalService.getTopRatedHospitals(limit);

    res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('평점 높은 병원 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평점 높은 병원 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
