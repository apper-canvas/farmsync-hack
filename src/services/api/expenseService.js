import expenseData from '../mockData/expenses.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ExpenseService {
  constructor() {
    this.expenses = [...expenseData]
  }

  async getAll() {
    await delay(300)
    return [...this.expenses]
  }

  async getById(id) {
    await delay(250)
    const expense = this.expenses.find(e => e.id === id)
    if (!expense) {
      throw new Error('Expense not found')
    }
    return { ...expense }
  }

  async create(expenseData) {
    await delay(400)
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData
    }
    this.expenses.push(newExpense)
    return { ...newExpense }
  }

  async update(id, updateData) {
    await delay(350)
    const index = this.expenses.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }
    
    this.expenses[index] = { ...this.expenses[index], ...updateData }
    return { ...this.expenses[index] }
  }

  async delete(id) {
    await delay(300)
    const index = this.expenses.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }
    
    this.expenses.splice(index, 1)
    return true
  }
}

export default new ExpenseService()