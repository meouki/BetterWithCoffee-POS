# Testing Patterns

Currently, PulsePoint relies exclusively on **Manual Verification** and **User Acceptance Testing (UAT)**. There is no automated test suite (Jest, Vitest, etc.) integrated into the build pipeline.

## Manual Testing Workflow
Feature verification is performed by walking through critical user journeys in the browser and inspecting the backend response logs.

### Primary Test Cases
- **Order Flow**: Selecting products, applying modifiers, completing checkout, and verifying stock deduction.
- **Inventory Management**: Manual stock adjustments and verifying automatic deduction based on recipe configurations.
- **User Authentication**: Testing multi-device login, session invalidation, and permission-based routing.
- **Data Safety**: Verifying that Database Export/Import functions correctly and triggers a clean system restart.

### API Testing
Developers use tools like `curl`, Postman, or Thunder Client to hit the Express routes directly for debugging.

## Verification Guidelines
When documenting a new feature in GSD, include a `VERIFICATION.md` in the phase directory with:
1. **Prerequisites**: What configuration is needed (e.g., "Add 5 Coffee Beans to inventory").
2. **Steps**: Detailed browser/API steps to exercise the feature.
3. **Expected Results**: What should happen visually and in the database.

## Future Plans
The project aims to introduce:
- **Playwright** for End-to-End (E2E) testing of critical flows.
- **Vitest** for unit testing critical components such as inventory calculators and receipt formatters.
- **Supertest** for automated API integration tests.
