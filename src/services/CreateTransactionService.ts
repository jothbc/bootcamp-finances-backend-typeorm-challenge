import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is incorrect');
    }

    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('Insufficient funds.')
    }

    let categoryExist = await categoryRepository.findOne({
      where: {
        title: category
      }
    })
    if (!categoryExist) {
      categoryExist = categoryRepository.create({
        title: category
      })
      await categoryRepository.save(categoryExist)
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryExist
    })

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
