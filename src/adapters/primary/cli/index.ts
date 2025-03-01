#!/usr/bin/env bun

import { program } from 'commander'
import { scrapeCommand } from './commands/scrape'
import { flowCommand } from './commands/flow'
import packageJson from '../../../../package.json'

program
  .name(packageJson.name)
  .version(packageJson.version)
  .addCommand(scrapeCommand)
  .addCommand(flowCommand)
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse(Bun.argv)
