import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id:string): Promise<void> {

    const repo = getRepository(Transaction);

    const transaction = await repo.findOne(id)

    if(!transaction){
      throw new AppError('This transaction does not exist.')
    }

    await repo.remove(transaction);
  }

}

export default DeleteTransactionService;
