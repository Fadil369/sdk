# Contributing to BrainSAIT Healthcare SDK

First off, thank you for considering contributing to the BrainSAIT Healthcare SDK. It's people like you that make this project such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [email@example.com](mailto:email@example.com).

## How Can I Contribute?

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/Fadil369/sdk/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/Fadil369/sdk/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue to discuss your enhancement. Clearly state the enhancement and the motivation for it.

### Pull Requests

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes (`npm test`).
5.  Make sure your code lints (`npm run lint`).
6.  Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### TypeScript Styleguide

- All TypeScript code must adhere to the official [TypeScript Style Guide](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).
- Use Prettier for formatting (`npm run format`).

## Development Setup

You will need Node.js version 18+ and npm version 8+.

1.  Fork and clone the repository.
2.  `npm install`
3.  `npm run dev` to start the development server.

## Testing

- `npm test` to run all tests.
- `npm run test:coverage` to run tests with coverage.
- `npm run test:ui` to run tests with the UI.

## Documentation

The documentation is built using VitePress.

- `npm run docs:dev` to start the documentation development server.
- `npm run docs:build` to build the documentation.