import { program } from 'commander'
import { scrapeCommand } from './commands/scrape'
import { flowCommand } from './commands/flow'

program
  .addCommand(scrapeCommand)
  .addCommand(flowCommand)
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse(Bun.argv)
