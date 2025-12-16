const { Pet, PetHealthConcern } = require('../models');
const { MAX_HEALTH_CONCERNS, VALID_HEALTH_CONCERNS } = require('../constants/petHealthConcerns');

class PetService {
  async createPet(userId, petData) {
    const { name, species, birthDate, healthConcerns = [] } = petData;

    if (healthConcerns.length > MAX_HEALTH_CONCERNS) {
      throw new Error(`건강 고민은 최대 ${MAX_HEALTH_CONCERNS}개까지 선택 가능합니다.`);
    }

    for (const concern of healthConcerns) {
      if (!VALID_HEALTH_CONCERNS.includes(concern)) {
        throw new Error(`유효하지 않은 건강 고민입니다: ${concern}`);
      }
    }

    const userPets = await Pet.findAll({ where: { userId, isDeleted: false } });
    const isPrimary = userPets.length === 0;
    const displayOrder = userPets.length;

    const pet = await Pet.create({
      userId,
      name,
      species,
      birthDate,
      breed: petData.breed,
      gender: petData.gender,
      weight: petData.weight,
      profileImageUrl: petData.profileImageUrl,
      isPrimary,
      displayOrder
    });

    if (healthConcerns.length > 0) {
      const concernRecords = healthConcerns.map(concern => ({
        petId: pet.petId,
        concernType: concern
      }));
      await PetHealthConcern.bulkCreate(concernRecords);
    }

    return this.getPetById(pet.petId);
  }

  async getPetsByUserId(userId) {
    const pets = await Pet.findAll({
      where: { userId, isDeleted: false },
      include: [{
        model: PetHealthConcern,
        as: 'healthConcerns',
        attributes: ['concernType']
      }],
      order: [['displayOrder', 'ASC']]
    });

    return pets.map(pet => ({
      petId: pet.petId,
      userId: pet.userId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      birthDate: pet.birthDate,
      weight: pet.weight,
      profileImageUrl: pet.profileImageUrl,
      isPrimary: pet.isPrimary,
      displayOrder: pet.displayOrder,
      healthConcerns: pet.healthConcerns.map(hc => hc.concernType),
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt
    }));
  }

  async getPetById(petId) {
    const pet = await Pet.findOne({
      where: { petId, isDeleted: false },
      include: [{
        model: PetHealthConcern,
        as: 'healthConcerns',
        attributes: ['concernType']
      }]
    });

    if (!pet) {
      throw new Error('반려동물을 찾을 수 없습니다.');
    }

    return {
      petId: pet.petId,
      userId: pet.userId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      birthDate: pet.birthDate,
      weight: pet.weight,
      profileImageUrl: pet.profileImageUrl,
      isPrimary: pet.isPrimary,
      displayOrder: pet.displayOrder,
      healthConcerns: pet.healthConcerns.map(hc => hc.concernType),
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt
    };
  }

  async updatePet(petId, userId, petData) {
    const pet = await Pet.findOne({
      where: { petId, userId, isDeleted: false }
    });

    if (!pet) {
      throw new Error('반려동물을 찾을 수 없습니다.');
    }

    const { healthConcerns, ...updateFields } = petData;

    if (healthConcerns !== undefined) {
      if (healthConcerns.length > MAX_HEALTH_CONCERNS) {
        throw new Error(`건강 고민은 최대 ${MAX_HEALTH_CONCERNS}개까지 선택 가능합니다.`);
      }

      for (const concern of healthConcerns) {
        if (!VALID_HEALTH_CONCERNS.includes(concern)) {
          throw new Error(`유효하지 않은 건강 고민입니다: ${concern}`);
        }
      }

      await PetHealthConcern.destroy({ where: { petId } });

      if (healthConcerns.length > 0) {
        const concernRecords = healthConcerns.map(concern => ({
          petId,
          concernType: concern
        }));
        await PetHealthConcern.bulkCreate(concernRecords);
      }
    }

    await pet.update(updateFields);

    return this.getPetById(petId);
  }

  async deletePet(petId, userId) {
    const pet = await Pet.findOne({
      where: { petId, userId, isDeleted: false }
    });

    if (!pet) {
      throw new Error('반려동물을 찾을 수 없습니다.');
    }

    await pet.update({ isDeleted: true });

    if (pet.isPrimary) {
      const remainingPets = await Pet.findAll({
        where: { userId, isDeleted: false },
        order: [['displayOrder', 'ASC']]
      });

      if (remainingPets.length > 0) {
        await remainingPets[0].update({ isPrimary: true });
      }
    }

    return { message: '반려동물이 삭제되었습니다.' };
  }

  async setPrimaryPet(petId, userId) {
    const pet = await Pet.findOne({
      where: { petId, userId, isDeleted: false }
    });

    if (!pet) {
      throw new Error('반려동물을 찾을 수 없습니다.');
    }

    await Pet.update(
      { isPrimary: false },
      { where: { userId, isDeleted: false } }
    );

    await pet.update({ isPrimary: true });

    return this.getPetById(petId);
  }
}

module.exports = new PetService();
