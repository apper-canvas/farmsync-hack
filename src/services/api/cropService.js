import cropData from '../mockData/crops.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class CropService {
  constructor() {
    this.crops = [...cropData]
  }

  async getAll() {
    await delay(300)
    return [...this.crops]
  }

  async getById(id) {
    await delay(250)
    const crop = this.crops.find(c => c.id === id)
    if (!crop) {
      throw new Error('Crop not found')
    }
    return { ...crop }
  }

  async create(cropData) {
    await delay(400)
    const newCrop = {
      id: Date.now().toString(),
      ...cropData
    }
    this.crops.push(newCrop)
    return { ...newCrop }
  }

  async update(id, updateData) {
    await delay(350)
    const index = this.crops.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Crop not found')
    }
    
    this.crops[index] = { ...this.crops[index], ...updateData }
    return { ...this.crops[index] }
  }

  async delete(id) {
    await delay(300)
    const index = this.crops.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Crop not found')
    }
    
    this.crops.splice(index, 1)
    return true
  }
}

export default new CropService()