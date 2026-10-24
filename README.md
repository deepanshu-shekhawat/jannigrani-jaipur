# JanNigrani (जननिगरानी)

JanNigrani is a Jaipur civic intelligence platform that helps citizens, municipal administrators, and public works teams manage civic issues through a single digital workflow.

The platform combines issue reporting, geospatial mapping, AI-assisted triage, authority routing, and public works accountability in one interface. It is designed to make urban service delivery more transparent, faster, and easier to monitor.

## Why this product exists

In many Indian cities, civic issues are reported in fragmented ways: on WhatsApp, through social media, via calls, or through local officials. The result is poor traceability, weak accountability, and slow follow-up.

JanNigrani addresses this by providing:

- a citizen-friendly way to report problems
- location-based issue visibility on a map
- automatic classification of the complaint category and severity
- routing to the relevant authority or department
- visibility into public record works and contractor data
- dashboard-based monitoring for civic operations teams

## What the platform does

### 1. Citizen reporting
Citizens can report issues such as:

- potholes
- broken streetlights
- garbage overflow
- waterlogging
- drain problems
- damaged roads or public infrastructure

Reports can include location, issue type, description, evidence, and urgency.

### 2. Location-aware civic intelligence
The platform presents complaints and infrastructure activity on a Jaipur map, helping teams understand where issues are clustering and which areas need immediate action.

### 3. AI-assisted triage and routing
The app includes service logic that helps infer issue type, severity, and likely owning authority. This reduces the effort required to route complaints correctly.

### 4. Authority and department visibility
The app provides a structured view of departments and authorities so civic teams can see which body is responsible for a complaint and how it is progressing.

### 5. Public works accountability
Beyond complaint intake, JanNigrani also shows public works records, tenders, maintenance contracts, and infrastructure projects. This helps connect citizen problems to actual civic action and procurement records.

### 6. Dashboard and admin workflow
The platform includes an operations dashboard for tracking issue status, monitoring backlog, and understanding the health of civic response workflows.

## Main user journeys

- A resident opens the app and reports a civic issue from a location.
- The system captures the issue and routes it to the correct department.
- Administrative users review the ticket and monitor resolution status.
- Civic teams can review public works information to understand active projects and infrastructure conditions nearby.
- Authorities can investigate patterns and act based on issue concentration and public works context.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Leaflet for map interactions
- Recharts for dashboard metrics
- Lucide React icons
- Local in-browser storage for prototype data

## Project structure

```text
src/
  components/
  data/
  pages/
  services/
  types/
  utils/
```

Key app areas include:

- home and landing experience
- map-based civic issue exploration
- report wizard for filing complaints
- complaint detail and resolution tracking
- dashboard and analytics
- public works registry and tender visibility
- authority information and admin workflows

## Getting started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev -- --host 0.0.0.0
```

Then open the local Vite URL in the browser, typically:

```text
http://localhost:3002/
```

### Production build

```bash
npm run build
```

## Hosting

The project is configured to deploy to GitHub Pages whenever changes are pushed to `master`.
After the first successful deployment, the website will be available at:

https://deepanshu-shekhawat.github.io/jannigrani-jaipur/

The Pages build uses the repository subpath as its asset base and publishes a `404.html`
fallback so direct navigation and refreshes on app routes work.

## Product vision

JanNigrani is a civic operations prototype for making urban service delivery more transparent and measurable. It demonstrates how digital reporting, intelligence, and public infrastructure data can be brought together to improve responsiveness and accountability in a city context.

## License

This project is intended for demonstration and prototype use.
