import type { RivalId } from './provider-compare.data';

// Additional cells for the combined view. The supplied comparisons do not
// cover every provider on every row; these entries use provider documentation.
// Google: https://knowledge.workspace.google.com/admin/users/add-or-delete-an-alternate-email-address-email-alias
// https://knowledge.workspace.google.com/admin/domains/add-a-user-alias-domain-or-secondary-domain
// https://knowledge.workspace.google.com/admin/compliance/data-covered-by-data-regions
// https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-marks-valid-email-messages-as-spam
// Microsoft: https://learn.microsoft.com/en-us/exchange/recipients-in-exchange-online/manage-permissions-for-recipients
// https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/work-with-cloud-based-message-recall
// https://learn.microsoft.com/en-us/defender-office-365/mdo-threat-classification
// Zoho: https://www.zoho.com/mail/help/adminconsole/rates-and-limits.html
// https://www.zoho.com/workplace/plan-comparison.html
// https://www.zoho.com/mail/gdpr.html
// https://help.zoho.com/portal/en/kb/crm/connect-with-customers/email/user-functions/articles/email-configuration-for-imap-and-pop3
export const COMPARISON_SUPPLEMENTS: Readonly<Record<string, Partial<Record<RivalId, string>>>> = {
  delegation: { microsoft: '✓ Full Access, Send As and Send on Behalf' },
  aliases: { google: '✓ Up to 30 per user, free', zoho: '✓ Up to 29 additional aliases' },
  files: { zoho: '✓ Workplace office apps and storage, by plan' },
  chat: { google: '✓ Google Meet', zoho: '✓ Zoho Meeting, by plan' },
  licensing: { google: 'Per-user plans', zoho: 'Per-user plans' },
  hosting: { google: '⚠ Data regions on eligible plans', zoho: '✓ Data centers in several regions; chosen at sign-up' },
  recall: { microsoft: '✓ Exchange recall; conditions apply' },
  rules: { microsoft: '✓ Exchange inbox rules', zoho: '✓ Mail filters' },
  domains: { microsoft: '✓ Multiple domains', google: '✓ Secondary domains and aliases' },
  mfa: { microsoft: '✓ Multi-factor authentication', google: '✓ 2-Step Verification' },
  ai: { microsoft: '✓ Defender AI and machine learning, by plan', google: '✓ Machine learning for spam detection' },
  crm: { microsoft: '✓ Zoho CRM integration', google: '✓ Gmail integration with Zoho CRM' },
};
