# Copilot Coding Agent Reset Prompt

Reset the main branch to match the golden-image branch.

- Create a new branch from golden-image (e.g., reset-main).
- Open a pull request from that branch to main that will revert all changes made to main after the initial state.
- (If possible) Merge the PR to fully restore main to the original golden-image state.
- Notify me when the reset is complete.

This should remove all changes made by Copilot or other contributors after the initial state and restore main to the golden-image baseline.
