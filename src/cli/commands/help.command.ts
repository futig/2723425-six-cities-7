import chalk from 'chalk';
import { Command } from './command.interface.js';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public execute(..._parameters: string[]): void {
    console.info(`
        ${chalk.bold('Программа для подготовки данных для REST API сервера.')}
        ${chalk.underline('Пример:')}
            ${chalk.cyan('cli.js --<command> [--arguments]')}
        ${chalk.underline('Команды:')}
            ${chalk.green('--version')}:                   ${chalk.gray('# выводит номер версии')}
            ${chalk.green('--help')}:                      ${chalk.gray('# печатает этот текст')}
            ${chalk.green('--import <path>')}:             ${chalk.gray('# импортирует данные из TSV')}
            ${chalk.green('--generate <n> <path> <url>')}  ${chalk.gray('# генерирует произвольное количество тестовых данных')}
    `);
  }
}
