import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const repoCategories = getRepository(Category);
    const repoTransactions = getRepository(Transaction);

    const readStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2, //linha de inicio de leitura do csv, como nao tem linha 0 e a linha 1 é o cabeçalho entao começo da linha 2
    })

    const parseCSV = readStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      //le linha por linha e desestrutura em valores separados
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    })

    //o comando acima é meio q assincrono e dispara um 'end' no fim da execução
    //para ver isso deve inserir a linha abaixo
    await new Promise(resolve => parseCSV.on('end', resolve));
    //isso faz com que espere essa linha ser finalizada para seguir..

    const categoriesFound = await repoCategories.find({
      where: {
        title: In(categories)
      }
    });

    const categoriesFoundTitles = categoriesFound.map(
      (category:Category) => category.title
    );

    const categoriesTitles = categories
      .filter(category => !categoriesFoundTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const createCategories = repoCategories.create(
      categoriesTitles.map(title => ({ title }))
    )

    await repoCategories.save(createCategories);

    const allCategories = [...createCategories, ...categoriesFound];

    const createTransactions = repoTransactions.create(
      transactions.map(transaction=>({
        title:transaction.title,
        type:transaction.type,
        value:transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category),
      }))
    )

    await repoTransactions.save(createTransactions);

    await fs.promises.unlink(filePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
