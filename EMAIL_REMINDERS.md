# Email Reminder System Documentation

## Overview

The MedResearch Academy website now includes an automated email reminder system that sends notifications to users who subscribe to upcoming sessions. The system sends two reminders:

1. **24-hour reminder** - Sent one day before the session
2. **1-hour reminder** - Sent one hour before the session starts

## Architecture

### Components

1. **Database Schema** (`drizzle/schema.ts`)
   - `reminders` table stores email subscriptions with tracking flags
   - Fields: `id`, `lectureId`, `email`, `reminderSent24h`, `reminderSent1h`, `createdAt`
   - Foreign key relationship with `lectures` table

2. **Email Service** (`server/lib/email.ts`)
   - `sendEmail()` - Sends emails using the Forge API
   - `generate24HourReminderEmail()` - Creates HTML template for 24-hour reminder
   - `generate1HourReminderEmail()` - Creates HTML template for 1-hour reminder
   - Professional email templates with session details, Zoom links, and branding

3. **Reminder Job** (`server/jobs/send-reminders.ts`)
   - `send24HourReminders()` - Checks for sessions starting in ~24 hours
   - `send1HourReminders()` - Checks for sessions starting in ~1 hour
   - `sendRemindersJob()` - Main function that runs both checks
   - Marks reminders as sent to prevent duplicates

4. **Scheduler** (`server/jobs/scheduler.ts`)
   - Runs the reminder job every 15 minutes
   - Starts automatically when the server starts
   - Handles graceful shutdown on SIGINT/SIGTERM

5. **Frontend Component** (`client/src/components/ReminderDialog.tsx`)
   - User interface for subscribing to reminders
   - Email input with validation
   - Success confirmation feedback

## How It Works

### User Flow

1. User visits the Programs page
2. Clicks "Get Reminder" button on an upcoming session
3. Enters their email address in the dialog
4. System creates a reminder subscription in the database
5. Automated job checks every 15 minutes for sessions needing reminders
6. Emails are sent at 24 hours and 1 hour before the session

### Technical Flow

```
Server Start
    ↓
Scheduler Starts (runs every 15 minutes)
    ↓
Check for sessions in ~24 hours
    ↓
Send 24-hour reminders (if not sent)
    ↓
Mark as sent (reminderSent24h = 1)
    ↓
Check for sessions in ~1 hour
    ↓
Send 1-hour reminders (if not sent)
    ↓
Mark as sent (reminderSent1h = 1)
```

## Email Templates

### 24-Hour Reminder
- **Subject**: "Reminder: [Session Title] starts in 24 hours"
- **Content**:
  - Session title and description
  - Date, time, and platform details
  - "Join Zoom Meeting" button
  - Note about upcoming 1-hour reminder

### 1-Hour Reminder
- **Subject**: "Starting Soon: [Session Title] in 1 hour!"
- **Content**:
  - Urgent alert banner
  - Session title
  - Start time prominently displayed
  - "Join Now" button
  - Tip to join early for audio/video testing

## Configuration

### Environment Variables

The email service uses the built-in Forge API with these environment variables (automatically configured):
- `BUILT_IN_FORGE_API_URL` - Forge API endpoint
- `BUILT_IN_FORGE_API_KEY` - API authentication key

### Scheduler Settings

Defined in `server/jobs/scheduler.ts`:
- **Interval**: 15 minutes (900,000 ms)
- **Window**: Checks for sessions within 15-minute windows around 24h and 1h marks

## Database Schema

```sql
CREATE TABLE reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lectureId INT NOT NULL,
  email VARCHAR(320) NOT NULL,
  reminderSent24h INT NOT NULL DEFAULT 0,
  reminderSent1h INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lectureId) REFERENCES lectures(id) ON DELETE CASCADE
);
```

## Testing

### Manual Test

Run the reminder job manually:

```bash
cd /home/ubuntu/dr_alawi_website
node test-reminders.mjs
```

### Check Logs

The scheduler logs all operations:
- `[Scheduler]` - Scheduler start/stop events
- `[24h Reminders]` - 24-hour reminder operations
- `[1h Reminders]` - 1-hour reminder operations
- `[Reminder Job]` - Job start/completion timestamps

### Verify Database

Check reminder subscriptions:

```sql
SELECT r.id, r.email, r.reminderSent24h, r.reminderSent1h, l.title, l.sessionDate 
FROM reminders r 
JOIN lectures l ON r.lectureId = l.id;
```

## API Integration

The reminder subscription is handled by the existing tRPC endpoint:

```typescript
// server/routers/sessions.ts
subscribeReminder: publicProcedure
  .input(z.object({
    lectureId: z.number(),
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    // Creates reminder subscription in database
  })
```

## Maintenance

### Adding New Reminder Types

To add additional reminder times (e.g., 1 week before):

1. Add new tracking field to schema: `reminderSent1week INT DEFAULT 0`
2. Run migration: `pnpm db:push`
3. Create email template function in `server/lib/email.ts`
4. Add check function in `server/jobs/send-reminders.ts`
5. Call from `sendRemindersJob()`

### Monitoring

Monitor the system by:
- Checking server logs for scheduler activity
- Querying database for sent/pending reminders
- Testing with real email addresses before production

### Troubleshooting

**Reminders not sending:**
- Check server logs for scheduler errors
- Verify Forge API credentials are configured
- Ensure database connection is working
- Check session dates are in the future

**Duplicate emails:**
- Verify tracking flags are being set correctly
- Check scheduler interval isn't too short
- Ensure database updates aren't failing silently

## Security Considerations

- Email addresses are stored but not validated beyond format
- No authentication required for subscription (public sessions)
- Rate limiting should be added for production
- Consider adding unsubscribe functionality
- GDPR compliance: add privacy notice and data retention policy

## Future Enhancements

1. **Unsubscribe Links** - Allow users to opt out of reminders
2. **Email Preferences** - Let users choose which reminders to receive
3. **SMS Reminders** - Add phone number option for SMS notifications
4. **Calendar Integration** - Automatically add to user's calendar
5. **Reminder History** - Track delivery status and open rates
6. **Batch Processing** - Optimize for large numbers of subscribers
7. **Email Templates** - Allow customization per session type
8. **Retry Logic** - Automatically retry failed email sends

## Production Checklist

Before deploying to production:

- [ ] Test email delivery with real email addresses
- [ ] Verify scheduler runs correctly after server restart
- [ ] Add monitoring/alerting for failed email sends
- [ ] Implement rate limiting on subscription endpoint
- [ ] Add unsubscribe functionality
- [ ] Review and update email templates with final branding
- [ ] Set up email analytics/tracking
- [ ] Document privacy policy for email collection
- [ ] Test with various email providers (Gmail, Outlook, etc.)
- [ ] Verify timezone handling for international users
