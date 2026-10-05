import * as dotenv from 'dotenv';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

dotenv.config();

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 *
 * Usage:
 * npm run dev -- <owner> <repo> <pr-number>
 */
async function main(): Promise<void> {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    process.exitCode = 1;
    return;
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error(
      'Error: <pr-number> must be a positive integer.'
    );
    process.exitCode = 1;
    return;
  }

  // Validate authentication.
  // Vocareum supplies ANTHROPIC_API_KEY automatically.
  const hasAnthropicApiKey =
    Boolean(process.env.ANTHROPIC_API_KEY);

  const hasBedrockCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasAnthropicApiKey && !hasBedrockCredentials) {
    console.error(
      'Authentication is not configured. Provide either ' +
      'ANTHROPIC_API_KEY or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY.'
    );
    process.exitCode = 1;
    return;
  }

  if (hasBedrockCredentials) {
    if (!process.env.AWS_REGION) {
      console.error(
        'AWS Bedrock authentication requires AWS_REGION.'
      );
      process.exitCode = 1;
      return;
    }

    console.log('🔐 Using AWS Bedrock authentication');
  } else {
    console.log('🔐 Using Anthropic API authentication');
  }

  // Validate required model configuration.
  if (!process.env.ANTHROPIC_MODEL) {
    console.error(
      'Error: ANTHROPIC_MODEL environment variable is required.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `🔍 Reviewing ${owner}/${repo} PR #${prNumber}...`
  );

  try {
    const orchestrator = new CodeReviewOrchestrator({
      model: process.env.ANTHROPIC_MODEL
    });

    const report =
      await orchestrator.reviewPullRequest(
        owner,
        repo,
        prNumber
      );

    const reportGenerator = new ReportGenerator();

    const markdown =
      reportGenerator.generateMarkdownReport(report);

    const html =
      reportGenerator.generateHTMLReport(report);

    const json =
      reportGenerator.generateJSONReport(report);

    const reportsDir = path.resolve(
      process.cwd(),
      'reports'
    );

    await fs.mkdir(reportsDir, { recursive: true });

    const baseName =
      `${owner}-${repo}-pr-${prNumber}`;

    await Promise.all([
      fs.writeFile(
        path.join(reportsDir, `${baseName}.md`),
        markdown,
        'utf8'
      ),
      fs.writeFile(
        path.join(reportsDir, `${baseName}.html`),
        html,
        'utf8'
      ),
      fs.writeFile(
        path.join(reportsDir, `${baseName}.json`),
        json,
        'utf8'
      )
    ]);

    console.log('\n✅ Review completed successfully.');
    console.log(`📄 Reports written to: ${reportsDir}`);
    console.log(`   - ${baseName}.md`);
    console.log(`   - ${baseName}.html`);
    console.log(`   - ${baseName}.json`);
  } catch (error) {
    console.error(
      '\n❌ Review failed:',
      error instanceof Error
        ? error.message
        : error
    );

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    'Fatal error:',
    error instanceof Error
      ? error.message
      : error
  );

  process.exitCode = 1;
});
