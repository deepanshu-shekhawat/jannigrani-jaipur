import { CivicCategory, CivicIssue, FollowUp, NotificationItem } from '../types';
import { StorageService } from './storageService';

export const FollowUpEngine = {
  // Generate question tailored to issue category & elapsed stage
  generateContextualQuestion(category: CivicCategory, stageDays: number): string {
    if (stageDays <= 1) {
      switch (category) {
        case 'roads_footpaths':
          return 'JanNigrani 24h Check: Have municipal road inspection markers or temporary barricades appeared at this road defect?';
        case 'waste_sanitation':
          return 'JanNigrani 24h Check: Has the morning door-to-door auto-tipper or municipal tractor collected waste from this spot?';
        case 'streetlights_electrical':
          return 'JanNigrani 24h Check: Did municipal electricity staff or JVVNL disconnect or isolate the hanging wires?';
        case 'drainage_waterlogging':
          return 'JanNigrani 24h Check: Has standing surface water drained into the sewer or is silt still blocking the grate?';
        case 'water_supply':
          return 'JanNigrani 24h Check: Has PHED isolated the water line valve or is potable water still leaking?';
        default:
          return 'JanNigrani 24h Check: Would you like to provide additional street landmarks or photos to clarify this location?';
      }
    } else if (stageDays <= 4) {
      switch (category) {
        case 'roads_footpaths':
          return 'JanNigrani 3-Day Follow-Up: Is the road crater still present, or have two-wheelers reported further skidding incidents?';
        case 'waste_sanitation':
          return 'JanNigrani 3-Day Follow-Up: Has the garbage depot been fully cleared, or is secondary waste accumulating again?';
        case 'streetlights_electrical':
          return 'JanNigrani 3-Day Follow-Up: Is the streetlight fixture functioning at night, or does the pole remain unlit?';
        case 'drainage_waterlogging':
          return 'JanNigrani 3-Day Follow-Up: Has any drainage de-silting crew arrived to clear the stormwater culvert?';
        default:
          return 'JanNigrani 3-Day Follow-Up: Is the reported civic problem still present at this location?';
      }
    } else {
      switch (category) {
        case 'roads_footpaths':
          return 'JanNigrani 7-Day Progress Audit: Can you provide an updated photo from the same viewpoint to verify if road repairs were performed?';
        case 'waste_sanitation':
          return 'JanNigrani 7-Day Progress Audit: Is door-to-door municipal collection now regular, or is open dumping recurring?';
        default:
          return 'JanNigrani 7-Day Progress Audit: Please share an updated status check or photo to document municipal progress.';
      }
    }
  },

  // Calculate schedule milestones when a report is created
  initializeScheduleForIssue(issue: CivicIssue): { nextFollowUpAt: string } {
    const created = new Date(issue.createdAt);
    // Milestone 1: 24h after creation
    const nextDate = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    return { nextFollowUpAt: nextDate.toISOString() };
  },

  // Evaluate all issues against current simulated clock
  runFollowUpEvaluation(): { newFollowUpsCount: number; evaluatedIssuesCount: number } {
    const issues = StorageService.getIssues();
    const existingFollowUps = StorageService.getFollowUps();
    const simulatedNow = StorageService.getSimulatedNow();
    let createdCount = 0;

    for (const issue of issues) {
      // Don't follow up on closed or citizen-resolved issues unless older than 14 days
      if (issue.status === 'closed_in_demo' || issue.status === 'citizen_resolved') {
        continue;
      }

      const createdTime = new Date(issue.createdAt).getTime();
      const elapsedDays = (simulatedNow.getTime() - createdTime) / (24 * 60 * 60 * 1000);

      // Check if a follow-up for this time window already exists
      const issueFollowUps = existingFollowUps.filter((f) => f.issueId === issue.id);

      // We schedule followups at 1 day, 3 days, and 7 days
      let targetStage = 0;
      if (elapsedDays >= 7) targetStage = 7;
      else if (elapsedDays >= 3) targetStage = 3;
      else if (elapsedDays >= 1) targetStage = 1;

      if (targetStage > 0) {
        // Has a follow-up been generated in the last 2 days?
        const recentFollowUp = issueFollowUps.some((f) => {
          const sentTime = new Date(f.scheduledAt).getTime();
          const diffDays = Math.abs(simulatedNow.getTime() - sentTime) / (24 * 60 * 60 * 1000);
          return diffDays < 1.5;
        });

        if (!recentFollowUp) {
          const questionText = this.generateContextualQuestion(issue.category, targetStage);
          const newFollowUpId = `FOL-${issue.id.replace('JN-', '')}-${issueFollowUps.length + 1}`;

          const newFollowUp: FollowUp = {
            id: newFollowUpId,
            issueId: issue.id,
            scheduledAt: simulatedNow.toISOString(),
            sentAt: simulatedNow.toISOString(),
            question: questionText,
            status: 'sent',
            createdBy: 'followup_engine',
            dataOrigin: 'demo_system',
          };

          StorageService.saveFollowUp(newFollowUp);

          // Add in-app notification
          const newNotif: NotificationItem = {
            id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            issueId: issue.id,
            title: `Follow-Up Check: ${issue.title.slice(0, 35)}...`,
            message: questionText,
            timestamp: simulatedNow.toISOString(),
            type: 'followup_due',
            read: false,
            actionLink: `/complaints/${issue.id}#follow-ups`,
          };
          StorageService.addNotification(newNotif);

          // Update issue next follow up date
          const nextTarget = new Date(simulatedNow.getTime() + 3 * 24 * 60 * 60 * 1000);
          StorageService.updateIssue(issue.id, {
            nextFollowUpAt: nextTarget.toISOString(),
          });

          createdCount++;
        }
      }
    }

    return {
      newFollowUpsCount: createdCount,
      evaluatedIssuesCount: issues.length,
    };
  }
};
