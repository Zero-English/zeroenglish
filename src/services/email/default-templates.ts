export interface DefaultTemplateDefinition {
  key: string;
  name: string;
  description: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  autoTriggerEnabled: boolean;
  isActive?: boolean;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplateDefinition[] = [
  {
    key: "LEADERBOARD_RANKING_TOP3",
    name: "Exam Leaderboard Top 3 Podium",
    description: "High-end editorial podium finish email sent to 1st, 2nd, and 3rd rankers upon exam results publication.",
    subject: "Podium Achievement: Rank #{{rank}} in {{examTitle}} — Zero English",
    variables: [
      "userName",
      "examTitle",
      "rank",
      "rankSuffix",
      "totalScore",
      "totalParticipants",
      "scoreInPercent",
      "leaderboardUrl",
      "certificateUrl",
      "logoUrl",
      "currentYear",
    ],
    autoTriggerEnabled: true,
    isActive: true,
    bodyText: `Congratulations {{userName}},\n\nYou achieved Rank #{{rank}} in {{examTitle}} with a score of {{totalScore}} ({{scoreInPercent}}%).\n\nView the official leaderboard: {{leaderboardUrl}}\n\nZero English Platform`,
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Podium Achievement — Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 50%, #c2410c 100%);"></td>
          </tr>

          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- Sub-badge & Title -->
          <tr>
            <td align="center" style="padding: 0 32px 24px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Official Leaderboard Ranking
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.4px; line-height: 1.3;">
                Outstanding Result, {{userName}}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                You secured a top podium finish in <span style="color: #18181b; font-weight: 600;">{{examTitle}}</span>.
              </p>
            </td>
          </tr>

          <!-- Creative Hero Rank Display -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="background-color: #09090b; border-radius: 12px; padding: 28px 20px; text-align: center; color: #ffffff;">
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; margin-bottom: 4px;">
                  Standing Position
                </div>
                <div style="font-size: 48px; font-weight: 800; line-height: 1; color: #ffffff; letter-spacing: -1px; margin-bottom: 18px;">
                  #{{rank}}<span style="font-size: 20px; font-weight: 600; color: #f97316; vertical-align: super;">{{rankSuffix}}</span>
                </div>
                
                <!-- Inner Stat Metrics -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #27272a; padding-top: 16px;">
                  <tr>
                    <td align="center" width="33.3%" style="border-right: 1px solid #27272a;">
                      <div style="font-size: 10px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Score</div>
                      <div style="font-size: 15px; font-weight: 700; color: #ffffff;">{{totalScore}}</div>
                    </td>
                    <td align="center" width="33.3%" style="border-right: 1px solid #27272a;">
                      <div style="font-size: 10px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Accuracy</div>
                      <div style="font-size: 15px; font-weight: 700; color: #f97316;">{{scoreInPercent}}%</div>
                    </td>
                    <td align="center" width="33.3%">
                      <div style="font-size: 10px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Participants</div>
                      <div style="font-size: 15px; font-weight: 700; color: #ffffff;">{{totalParticipants}}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Primary Action Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #09090b;">
                    <a href="{{leaderboardUrl}}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                      View Official Leaderboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimalist Clean Footer -->
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    key: "LEADERBOARD_PARTICIPANT",
    name: "Exam Participant Standing & Score",
    description: "Clean, high-contrast performance summary sent to exam participants.",
    subject: "Exam Performance Summary: {{examTitle}} — Zero English",
    variables: [
      "userName",
      "examTitle",
      "rank",
      "rankSuffix",
      "totalScore",
      "totalParticipants",
      "scoreInPercent",
      "leaderboardUrl",
      "logoUrl",
      "currentYear",
    ],
    autoTriggerEnabled: true,
    isActive: true,
    bodyText: `Hello {{userName}},\n\nYour results for {{examTitle}} are ready. You placed Rank #{{rank}} with a score of {{totalScore}} ({{scoreInPercent}}%).\n\nView leaderboard: {{leaderboardUrl}}\n\nZero English Team`,
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Performance Summary — Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: #18181b;"></td>
          </tr>

          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- Title & Context -->
          <tr>
            <td align="center" style="padding: 0 32px 24px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Exam Results Summary
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.4px; line-height: 1.3;">
                Performance Report, {{userName}}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                Here is your official standing for <span style="color: #18181b; font-weight: 600;">{{examTitle}}</span>.
              </p>
            </td>
          </tr>

          <!-- Metric Cards Grid -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #fafafa;">
                <tr>
                  <td align="center" width="33.3%" style="padding: 18px 8px; border-right: 1px solid #e4e4e7;">
                    <div style="font-size: 10px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Rank</div>
                    <div style="font-size: 20px; font-weight: 800; color: #09090b;">#{{rank}}</div>
                  </td>
                  <td align="center" width="33.3%" style="padding: 18px 8px; border-right: 1px solid #e4e4e7;">
                    <div style="font-size: 10px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Score</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ea580c;">{{totalScore}}</div>
                  </td>
                  <td align="center" width="33.3%" style="padding: 18px 8px;">
                    <div style="font-size: 10px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Accuracy</div>
                    <div style="font-size: 20px; font-weight: 800; color: #059669;">{{scoreInPercent}}%</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #09090b;">
                    <a href="{{leaderboardUrl}}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                      View Full Leaderboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimalist Footer -->
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    key: "WELCOME_USER",
    name: "New Learner Welcome Guide",
    description: "Minimalist onboarding guide introducing platform capabilities to newly registered students.",
    subject: "Welcome to Zero English, {{userName}}",
    variables: ["userName", "userEmail", "exploreUrl", "logoUrl", "currentYear"],
    autoTriggerEnabled: true,
    isActive: true,
    bodyText: `Welcome to Zero English, {{userName}}.\n\nYour account is active and ready. Explore smart vocabulary decks and test your skills with timed exams.\n\nStart now: {{exploreUrl}}\n\nZero English Team`,
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);"></td>
          </tr>

          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- Greeting Header -->
          <tr>
            <td align="center" style="padding: 0 32px 24px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Account Active
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.4px; line-height: 1.3;">
                Welcome to Zero English, {{userName}}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                Accelerate your English fluency with intelligent spaced repetition and timed exams.
              </p>
            </td>
          </tr>

          <!-- Feature Cards (Clean Minimalist Panels) -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px;">
                    <div style="font-size: 11px; font-weight: 700; color: #f97316; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px;">01 / Vocabulary Explorer</div>
                    <div style="font-size: 13px; color: #52525b; line-height: 1.5;">Master curated word collections with contextual examples and phonetic guides.</div>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px;">
                    <div style="font-size: 11px; font-weight: 700; color: #f97316; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px;">02 / Timed Exam Competitions</div>
                    <div style="font-size: 13px; color: #52525b; line-height: 1.5;">Compete on global leaderboards and measure your retention in real time.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #09090b;">
                    <a href="{{exploreUrl}}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                      Enter Learning Hub
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimalist Footer -->
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    key: "CUSTOM_BROADCAST",
    name: "Custom Broadcast / Announcement",
    description: "Simple, creative editorial layout for platform announcements.",
    subject: "Notice: {{subject}} — Zero English",
    variables: ["userName", "userEmail", "message", "logoUrl", "currentYear"],
    autoTriggerEnabled: false,
    isActive: true,
    bodyText: `Hello {{userName}},\n\n{{message}}\n\nZero English Team`,
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Platform Announcement — Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: #18181b;"></td>
          </tr>

          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Platform Announcement
              </div>
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.3px; line-height: 1.3;">
                Hello {{userName}},
              </h1>
              <div style="font-size: 14px; color: #3f3f46; line-height: 1.7;">
                {{message}}
              </div>
            </td>
          </tr>

          <!-- Minimalist Footer -->
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];
