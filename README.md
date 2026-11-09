# EZ-Bench

**An LLM-powered code repair benchmarking tool.**

EZ-Bench evaluates how effectively different Large Language Models (LLMs) solve software bugs by generating code patches and testing them against predefined test suites.

Instead of relying on subjective evaluations, EZ-Bench uses actual code execution and test results to measure model performance.

[GitHub Repository](https://github.com/dhanik0003/EZ-Bench)

---

## Overview

EZ-Bench automates the process of evaluating LLMs on software debugging and code repair tasks.

For each benchmark task, EZ-Bench:

1. Loads a predefined coding issue from the benchmark dataset.
2. Clones or reuses the associated GitHub repository.
3. Checks out the specified base commit.
4. Installs the repository dependencies.
5. Sends the issue description and relevant code context to the selected LLM.
6. Receives a generated Git patch.
7. Applies the patch to the repository.
8. Executes hidden evaluation tests.
9. Calculates a score based on test results.
10. Saves the benchmark results.

The same benchmark tasks can be executed against different LLM providers, allowing their code repair capabilities to be compared under consistent conditions.

## Features

- **Multi-provider support:** Integrates Groq, Google Gemini and OpenRouter.
- **Automated patch generation:** Generates code changes from issue descriptions.
- **Git integration:** Clones repositories, checks out specific commits and applies generated patches.
- **Automated evaluation:** Runs hidden tests against generated patches.
- **Performance measurement:** Tracks execution time, passed tests, failed tests and scores.
- **Configurable benchmarks:** Defines tasks using a JSON dataset.
- **Provider abstraction:** Allows additional LLM providers to be integrated through a common interface.

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Main programming language |
| Node.js | Runtime environment |
| Groq SDK | Groq API integration |
| Google GenAI SDK | Gemini API integration |
| OpenRouter API | Access to multiple LLMs |
| Simple Git | Git repository management |
| Vitest / npm test | Automated test execution |
| JSON | Benchmark task definitions and result storage |

## Architecture

```text
                  EZ-Bench
                      |
                      v
                Task Loader
                      |
                      v
                 Task Runner
                      |
             +--------+--------+
             |                 |
             v                 v
        Git Manager       LLM Provider
             |                 |
             v          +------+------+
       Checkout Base    |      |      |
          Commit       Groq  Gemini OpenRouter
             |          |      |      |
             |          +------+------+
             |                 |
             |           Generate Patch
             |                 |
             +--------<--------+
                      |
                      v
                 Apply Patch
                      |
                      v
                Test Runner
                      |
                      v
               Result Processor
                      |
                      v
                Result Saver
                      |
                      v
                results.json
```

## Project Structure

```text
EZ-Bench/
│
├── src/
│   ├── git/
│   │   └── repoManager.ts
│   │
│   ├── llm/
│   │   ├── provider.ts
│   │   ├── providerFactory.ts
│   │   ├── groqProvider.ts
│   │   ├── geminiProvider.ts
│   │   ├── openRouterProvider.ts
│   │   └── patchGenerator.ts
│   │
│   ├── runner/
│   │   ├── taskLoader.ts
│   │   ├── taskRunner.ts
│   │   ├── resultProcessor.ts
│   │   └── resultSaver.ts
│   │
│   ├── tests/
│   │   └── testRunner.ts
│   │
│   ├── types/
│   │   └── task.ts
│   │
│   └── index.ts
│
├── tasks/
│   └── tasks.json
│
├── results/
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Git
- An API key from at least one supported LLM provider

### 1. Clone the repository

```bash
git clone https://github.com/dhanik0003/EZ-Bench.git

cd EZ-Bench
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
# Select the LLM provider
LLM_PROVIDER=groq

# Groq
GROQ_API_KEY=your_groq_api_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
```

Only the API key corresponding to your selected provider is required.

**Supported provider values:**

| Provider | Environment value |
|---|---|
| Groq | `groq` |
| Google Gemini | `gemini` |
| OpenRouter | `openrouter` |

Never commit your `.env` file or expose API keys.

### 4. Run TypeScript checks

```bash
npm run typecheck
```

### 5. Start EZ-Bench

```bash
npm run start
```

EZ-Bench will execute the configured benchmark tasks and save the results.

## Benchmark Tasks

Benchmark tasks are defined in `tasks/tasks.json`.

Each task contains information such as:

- Repository URL
- Base commit
- Expected fix commit
- Target source files
- Hidden test files
- Issue title and description
- Difficulty level
- Test evaluation configuration

Example task structure:

```json
{
  "id": 1,
  "repo": "bench-math-utils",
  "repoUrl": "https://github.com/username/bench-math-utils",
  "baseCommit": "base_commit_hash",
  "fixCommit": "fix_commit_hash",
  "targetFiles": ["src/math.js"],
  "hiddenTestFiles": ["tests/math.test.js"],
  "issueTitle": "Fix average calculation",
  "issueDescription": "The average function fails for empty arrays.",
  "difficulty": "EASY",
  "failToPass": [],
  "passToPass": [],
  "status": "PENDING"
}
```

## Evaluation Methodology

EZ-Bench evaluates generated patches using automated test execution.

### Scoring

The score is calculated using the ratio of passed tests to total tests.

\[
\text{Score} =
\frac{\text{Passed Tests}}{\text{Total Tests}}
\times 100
\]

For example:

| Metric | Result |
|---|---:|
| Passed tests | 8 |
| Failed tests | 2 |
| Total tests | 10 |
| Score | 80% |

A score of 100% means all evaluation tests passed.

### Performance Metrics

EZ-Bench currently tracks:

- Test pass count
- Test failure count
- Overall score
- Execution time
- Provider and model information

## Current Benchmark Results

Initial testing has been performed using four benchmark tasks.

| Provider | Passed | Failed | Score |
|---|---:|---:|---:|
| Groq | 30 | 0 | 100% |
| OpenRouter | 30 | 0 | 100% |
| Google Gemini | API errors | — | Not completed |

These are preliminary results from a small benchmark dataset, not a general ranking of the providers.

## Roadmap

- [x] Build the benchmark task loader.
- [x] Implement Git repository management.
- [x] Implement automated patch generation.
- [x] Integrate Groq.
- [x] Integrate Google Gemini.
- [x] Integrate OpenRouter.
- [x] Implement automated test execution.
- [x] Implement benchmark scoring.
- [ ] Integrate Prisma ORM.
- [ ] Migrate result storage to PostgreSQL.
- [ ] Add persistent benchmark run history.
- [ ] Build a benchmark comparison dashboard.
- [ ] Add more LLM providers and models.
- [ ] Expand the benchmark dataset.
- [ ] Add GitHub integration.

## Future Goals

The long-term goal of EZ-Bench is to provide a structured environment for evaluating and comparing LLMs on real-world software engineering tasks.

Future versions will focus on:

- Comparing models across identical benchmark datasets.
- Tracking historical model performance.
- Measuring patch quality beyond test pass rates.
- Comparing execution speed and reliability.
- Providing visual analytics and model leaderboards.

## Contributing

Contributions, suggestions and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Run the TypeScript checks.
5. Submit a pull request.

## License

No license has been specified yet.