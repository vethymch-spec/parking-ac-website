import process from "node:process";
import { spawn } from "node:child_process";

const WORKFLOW_NAMES = ["locale-qa", "code-review"];

function parseArgs(argv) {
  const [workflowName, ...rest] = argv;
  const options = {
    workflowName,
    ask: false,
    provider: "claude",
    agent: null,
    scope: "changed-files",
  };

  for (const arg of rest) {
    if (arg === "--ask") {
      options.ask = true;
      continue;
    }

    if (arg.startsWith("--provider=")) {
      options.provider = arg.slice("--provider=".length).trim();
      continue;
    }

    if (arg.startsWith("--agent=")) {
      options.agent = arg.slice("--agent=".length).trim();
      continue;
    }

    if (arg.startsWith("--scope=")) {
      options.scope = arg.slice("--scope=".length).trim() || options.scope;
    }
  }

  return options;
}

function getWorkflowSpec(options) {
  const specs = {
    "locale-qa": {
      defaultAgent: "verifier",
      title: "Locale Validation Workflow",
      inSessionCommands: [
        '/team 2:verifier "Validate CoolDrivePro localized blog data quality. Sync locale indexes first, then check missing fields, malformed JSON, and SEO URL consistency."',
        '/autopilot "Run locale quality gate for CoolDrivePro: sync index, validate localized payloads, then report coverage gaps by locale."',
      ],
      prompt: [
        "You are auditing multilingual data quality for CoolDrivePro blog content.",
        "Validation scope:",
        "- Run npm run sync:blog-index",
        "- Run npm run validate:blog-locales",
        "- Re-check locale-availability.json consistency",
        "- Confirm localized list.json and manifest.json are valid arrays",
        "Deliver:",
        "- Critical errors first",
        "- Suggested fixes grouped by locale",
        "- A rerun command block for final verification",
      ].join("\n"),
    },
    "code-review": {
      defaultAgent: "code-reviewer",
      title: "Code Review Workflow",
      inSessionCommands: [
        '/team 3:code-reviewer "Review CoolDrivePro changed files for bugs, regression risks, and missing tests. Prioritize functional defects over style."',
        '/team 1:security-reviewer "Audit changed backend/admin paths for auth, secrets, and injection risks."',
      ],
      prompt: [
        "You are performing a strict code review for CoolDrivePro.",
        "Review scope:",
        `- ${options.scope}`,
        "Focus order:",
        "1) Behavioral regressions",
        "2) SEO/i18n correctness",
        "3) Security and data handling",
        "4) Missing tests or validation gaps",
        "Output format:",
        "- Findings first, ordered by severity",
        "- Each finding includes file path and concrete fix suggestion",
        "- End with residual risk summary",
      ].join("\n"),
    },
  };

  return specs[options.workflowName] || null;
}

function printUsage() {
  console.log("Usage: node scripts/omc-workflow.mjs <locale-qa|code-review> [--ask] [--provider=claude|codex|gemini] [--agent=name] [--scope=changed-files]");
}

function runAsk(options, spec) {
  const agent = options.agent || spec.defaultAgent;
  const args = [
    "ask",
    options.provider,
    "--agent-prompt",
    agent,
    "--prompt",
    spec.prompt,
  ];

  const child = spawn("omc", args, { stdio: "inherit" });
  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.workflowName || !WORKFLOW_NAMES.includes(options.workflowName)) {
    printUsage();
    process.exit(1);
  }

  const spec = getWorkflowSpec(options);
  if (!spec) {
    printUsage();
    process.exit(1);
  }

  console.log(spec.title);
  console.log("\nIn-session commands:");
  for (const command of spec.inSessionCommands) {
    console.log(`- ${command}`);
  }

  console.log("\nAdvisor prompt:");
  console.log(spec.prompt);

  if (!options.ask) {
    console.log("\nTip: add --ask to run this prompt via omc ask.");
    return;
  }

  runAsk(options, spec);
}

main();
