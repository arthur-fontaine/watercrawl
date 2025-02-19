import { program } from 'commander'
import { scrapeCommand } from './commands/scrape'

program
  .addCommand(scrapeCommand)
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse(Bun.argv)
