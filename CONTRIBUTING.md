# How to Contribute to tarkov-dev 💻

> This contributing guide is specfic to the [tarkov-dev](https://github.com/the-hideout/tarkov-dev) repo but many of its practices are shared with other repos in [the-hideout](https://github.com/the-hideout)

## Reporting a Bug 🐛

- Do not open up a GitHub issue if the bug is a security vulnerability, and instead to refer to our [security policy](SECURITY.md)
- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/the-hideout/tarkov-dev/issues)
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/the-hideout/tarkov-dev/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring (if possible)

## Opening a Pull Request 🌟

If you have a fix for a bug or a feature request, follow the flow below to purpose your change

> If you are new to creating pull requests from a repository fork, check out this [guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)

### Pull Request - TL;DR

If you don't want to read the detailed section below (you should), here is a TL;DR for our PR process:

1. Open a PR with changes
2. A team member will run CI, review, and deploy (first to dev, then prod)
3. If all looks good, we merge the PR

## Pull Request - Detailed

1. Fork the [tarkov-dev](https://github.com/the-hideout/tarkov-dev) repo
2. Clone your forked repo
3. Make your changes and ensure they work locally
4. Push your changes to your forked repo
5. Open a pull request on GitHub with the `tarkov-dev` repo and the `main` branch as the target
6. Ensure your pull request has a meaningful title, description, and links to any related issues

Hooray! You have opened a PR with your changes. Now a member from [the-hideout/reviewers](https://github.com/orgs/the-hideout/teams/reviewers) will step in and follow the process below:

1. A [the-hideout/reviewers](https://github.com/orgs/the-hideout/teams/reviewers) member will review your PR
2. They will run the GitHub Actions CI suite on your PR
3. If CI is passing, they will comment `.deploy to development` to ship your changes to our development environment
4. At this point, the reviewer will review the changes live in development. You should also test your changes as well in this environment to ensure they are working as expected
5. If all looks good, the reviewer will run `.deploy` to ship your changes to our production environment
6. If nothing goes wrong, the reviewer will merge the PR
7. 🎉
