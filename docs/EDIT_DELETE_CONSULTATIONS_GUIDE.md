# ?? Edit & Delete Consultations - User Guide

## ? Feature Added

You can now **edit** and **delete/cancel** scheduled consultations directly from the Consultations page.

---

## ?? How to Edit a Consultation

### **Step 1: Open Consultations Page**

Navigate to: **Dashboard** ? **?? Consultatii**

### **Step 2: Find the Consultation**

- Use filters to find your consultation:
  - **Time range:** Azi / Sapt. / Luna / Toate
  - **Status filter:** Programata / Confirmata / etc.

### **Step 3: Click Edit Button**

On the consultation card, click the **?? Editeaza** button (orange button).

**Note:** Edit button only appears for:
- ? **Programata** (Scheduled)
- ? **Confirmata** (Confirmed)

**You cannot edit:**
- ? **Finalizata** (Completed)
- ? **Anulata** (Cancelled)
- ? **Absent** (No-show)

### **Step 4: Edit Form**

The **Edit Consultation** modal opens with current details pre-filled:

```
?????????????????????????????????????????
  EDITEAZA CONSULTATIE
  Lead: Mihalache ion
?????????????????????????????????????????

?? Info consultatie curenta:
Lead: Mihalache ion
Programat original: 01 apr., 06:04

???????????????????????????????????????????

Avocat: *
[Maria Ionescu ?]  (can change lawyer)

Tip consultatie: *
[Fizic ?]  (can change type)

???????????????????????????????????????????

Data si ora: *
[2026-04-01T06:04]  (can reschedule)

Durata:
[30 min ?]  (15/30/45/60/90/120 min)

???????????????????????????????????????????

? Ore libere: 09:00, 09:30, 10:00, 14:00...
(Shows real-time availability for selected lawyer)

???????????????????????????????????????????

Locatie: (if Fizic selected)
[Str. Victoriei nr. 25, Bucuresti]

???????????????????????????????????????????

Note de pregatire (interne):
[Revizuire documente - dosarul divort]

???????????????????????????????????????????

[Anuleaza]              [?? Actualizeaza]
```

**You can change:**
- ?? **Lawyer** - Reassign to different lawyer
- ?? **Date & Time** - Reschedule to any future date/time
- ?? **Duration** - Change from 15 to 120 minutes
- ?? **Type** - Change between Telefon / Video / Fizic
- ?? **Location** - Update location (for in-person)
- ?? **Preparation Notes** - Update internal notes

**Real-time availability:**
- System shows available time slots for selected lawyer
- Prevents scheduling conflicts automatically
- Updates when you change lawyer, date, or duration

### **Step 5: Save Changes**

Click **?? Actualizeaza** to save changes.

**System Actions:**
- ? Updates consultation in database
- ? Updates lead activity log
- ? Sends notification to new lawyer (if changed)
- ? Updates calendar events
- ? Sends updated confirmation email to client (if email enabled)

**Success Message:**
```
? Consultation updated successfully
```

---

## ??? How to Delete/Cancel a Consultation

### **Option 1: Cancel Button (Soft Cancel)**

1. Open **?? Consultatii** page
2. Find consultation card
3. Click **Anuleaza** button (red button)
4. Consultation status changes to **Anulata**

**What happens:**
- Status: Programata ? **Anulata** ?
- Lead status: Updates if needed
- Calendar events: Removed
- Notifications: Cancellation email sent (if enabled)
- Data: **Preserved** (consultation remains in database as cancelled)

---

### **Option 2: Delete Button (Permanent Delete)**

1. Open **?? Consultatii** page
2. Find consultation card
3. Click **??? Sterge** button (red button with trash icon)
4. **Confirmation dialog appears:**

```
?????????????????????????????????????????
?? Confirmare stergere
?????????????????????????????????????????

Sigur doriti sa anulati aceasta consultatie?

Consultatie:
?? 01 aprilie 2026, 06:04
?? Mihalache ion
?? Maria Ionescu
?? Fizic - Str. Victoriei nr. 25

Aceasta actiune va:
? Marca consultatia ca anulata
? Actualiza statusul lead-ului
? Trimite email de anulare (optional)

[Anuleaza]  [DA, Sterge]
?????????????????????????????????????????
```

5. Click **DA, Sterge** to confirm

**What happens:**
- Status: Programata ? **Anulata** ?
- `IsDeleted` flag: **true** (soft delete)
- Lead status: Reverts to **Contactat** (if no other consultations)
- Lead activity: Logs "ConsultationCancelled"
- Calendar: Event removed
- Data: **Preserved** in database (soft delete, can be restored by admin)

**Note:** Delete button only appears for:
- ? **Programata** (Scheduled)
- ? **Confirmata** (Confirmed)

**You cannot delete:**
- ? **Finalizata** (Completed) - use "Anuleaza" status change instead
- ? **Already Anulata** (Cancelled)
- ? **Absent** (No-show)

---

## ?? UI Changes

### **Consultation Card - Before:**

```
?????????????????????????????????????????????????
?? 06:04 (30 min)  [Fizic]  [Programata]

Mihalache ion · Maria Ionescu · Str. Victoriei nr. 25

[Confirma] [Finalizata] [Absent] [Anuleaza] [Note]
?????????????????????????????????????????????????
```

### **Consultation Card - After (NEW):**

```
?????????????????????????????????????????????????
?? 06:04 (30 min)  [Fizic]  [Programata]

Mihalache ion · Maria Ionescu · Str. Victoriei nr. 25

[?? Editeaza] [Confirma] [Finalizata] [Absent] [Anuleaza] [Note] [??? Sterge]
     ? NEW                                                            ? NEW
??????????????????????????????????????????????????
```

**New Buttons:**
- ?? **?? Editeaza** - Opens edit modal (orange button)
- ?? **??? Sterge** - Deletes/cancels consultation (red button)

**Button States:**
- **?? Editeaza:** Only visible for Programata/Confirmata
- **??? Sterge:** Only visible for Programata/Confirmata
- **Loading state:** Shows ? icon while deleting

---

## ?? Important Notes

### **Editing:**
- ? **Can edit:** Scheduled and Confirmed consultations
- ? **Cannot edit:** Completed, Cancelled, or No-show consultations
- ?? **Availability check:** System prevents scheduling conflicts
- ?? **Notifications:** Updated confirmation emails sent automatically (if enabled)

### **Deleting:**
- ?? **Soft delete:** Consultation remains in database as "Cancelled"
- ? **Can restore:** Admins can restore cancelled consultations (via database)
- ?? **Lead status:** Automatically reverts if no other consultations exist
- ?? **Analytics:** Cancelled consultations excluded from conversion stats

### **Lead Status Changes:**

**When you delete the ONLY consultation for a lead:**
```
Before: Lead Status = "Consultatie Programata"
After:  Lead Status = "Contactat"  (reverts)
```

**When you delete ONE of MULTIPLE consultations:**
```
Before: Lead Status = "Consultatie Programata"
After:  Lead Status = "Consultatie Programata"  (unchanged)
        (because other consultations still exist)
```

---

## ?? Testing Steps

### **Test Edit:**

1. Go to **?? Consultatii**
2. Find a **Programata** consultation
3. Click **?? Editeaza**
4. Change lawyer to different lawyer
5. Change date to tomorrow
6. Change duration to 45 min
7. Add location or notes
8. Click **?? Actualizeaza**
9. **Verify:**
   - ? Consultation updated in list
   - ? New lawyer name displays
   - ? New date displays
   - ? Activity logged in lead timeline

---

### **Test Delete:**

1. Go to **?? Consultatii**
2. Find a **Programata** consultation
3. Click **??? Sterge**
4. **Confirmation dialog appears**
5. Click **DA, Sterge**
6. **Verify:**
   - ? Consultation disappears from list
   - ? Lead status updated (if last consultation)
   - ? Activity logged: "ConsultationCancelled"

---

## ?? Complete Workflow Example

### **Scenario:** Client needs to reschedule

**Initial:**
```
?? Consultatie Programata
Lead: Maria Popescu
Date: 20 martie 2026, 10:00
Lawyer: Ion Popescu
Type: Fizic
```

**Client calls:** "Can we reschedule to next week with different lawyer?"

**Steps:**

1. **?? Consultatii** ? Find consultation
2. **?? Editeaza** ? Opens edit modal
3. Change:
   - Lawyer: Ion Popescu ? **Maria Ionescu**
   - Date: 20 mar., 10:00 ? **27 mar., 14:00**
   - Type: Fizic ? **Video**
4. **?? Actualizeaza** ? Save changes

**Result:**
```
? Consultatie Actualizata
Lead: Maria Popescu
Date: 27 martie 2026, 14:00  (NEW)
Lawyer: Maria Ionescu         (NEW)
Type: Video                   (NEW)
Link video: https://meet.legalro.ro/abc123  (AUTO-GENERATED)

?? Email sent to:
- Maria Popescu (client) - Updated consultation details
- Maria Ionescu (new lawyer) - New assignment notification
- Ion Popescu (old lawyer) - Cancellation notification
```

---

## ?? Error Handling

### **Scheduling Conflict:**

```
?????????????????????????????????????????
?? Eroare
?????????????????????????????????????????

Lawyer has a scheduling conflict at this time.

Avocatul selectat are deja o consultatie
programata la aceasta ora.

Ore libere pentru 27 martie:
09:00, 09:30, 11:00, 14:00, 15:30...

[Inchide]
?????????????????????????????????????????
```

**Solution:** Choose a different time slot from available times.

---

### **Cannot Edit Past Consultation:**

**Error:** "Consultation cannot be edited because it's already completed/cancelled."

**Reason:** Only **Programata** and **Confirmata** consultations can be edited.

**Solution:**
- For completed consultations: Use **Note** button to add notes
- For cancelled consultations: Create new consultation instead

---

### **Network Error:**

```
?? Eroare: Network error - Please check your connection
```

**Solutions:**
1. Check internet connection
2. Verify backend is running (`https://localhost:5001`)
3. Check browser console for errors
4. Try refreshing page (Ctrl+R)
5. Clear browser cache

---

## ?? Button Reference

| Button | Color | Icon | Action | Available When |
|--------|-------|------|--------|----------------|
| **?? Editeaza** | ?? Orange | ?? | Open edit modal | Programata, Confirmata |
| **Confirma** | ?? Green | ? | Mark as confirmed | Programata |
| **Finalizata** | ?? Blue | ? | Mark as completed | Programata, Confirmata |
| **Absent** | ? Gray | - | Mark as no-show | Any active status |
| **Anuleaza** | ?? Red | × | Mark as cancelled | Any active status |
| **Note** | ?? Purple | ?? | Add/edit notes | Always |
| **??? Sterge** | ?? Red | ??? | Delete consultation | Programata, Confirmata |

---

## ?? Tips & Best Practices

### **When to Edit vs. Cancel:**

**Edit when:**
- ? Client requests reschedule
- ? Lawyer unavailable (reassign)
- ? Change type (phone ? video)
- ? Update location/duration

**Cancel/Delete when:**
- ? Client cancels permanently
- ? Duplicate consultation created
- ? Lead converted elsewhere
- ? Consultation no longer needed

### **Notification Best Practices:**

**After editing:**
1. Send manual email/SMS to client confirming changes
2. Notify previous lawyer if reassigned
3. Update any external calendars (Google/Outlook)

**After deleting:**
1. Verify client was notified
2. Check lead status is correct
3. Reschedule if needed (create new consultation)

---

## ?? Technical Details

### **Backend Endpoints:**

```
PUT /api/consultations/{id}
- Updates consultation details
- Checks for scheduling conflicts
- Logs activity

DELETE /api/consultations/{id}
- Soft deletes (marks as cancelled)
- Updates lead status if needed
- Logs cancellation activity
```

### **Database Changes:**

**Update:**
```sql
UPDATE legal.Consultations
SET 
    LawyerId = 'new-guid',
    ScheduledAt = '2026-03-27 14:00:00',
    Type = 2,
    Location = NULL,
    VideoMeetingLink = 'https://meet.legalro.ro/abc123',
    UpdatedAt = GETUTCDATE()
WHERE Id = 'consultation-guid';
```

**Delete (Soft):**
```sql
UPDATE legal.Consultations
SET 
    Status = 4,  -- Cancelled
    IsDeleted = 1,
    UpdatedAt = GETUTCDATE()
WHERE Id = 'consultation-guid';
```

### **Lead Status Logic:**

**On Delete:**
```csharp
// Check if lead has other consultations
var hasOtherConsultations = await _context.Consultations
    .AnyAsync(c => 
        c.LeadId == consultation.LeadId &&
        c.Id != id &&
        c.Status != ConsultationStatus.Cancelled &&
        !c.IsDeleted);

if (!hasOtherConsultations)
{
    // Revert lead status
    consultation.Lead.Status = LeadStatus.Contacted;
}
```

---

## ?? Complete Status Flow

```
???????????????????????????????????????????????????
?  CONSULTATION LIFECYCLE                          ?
???????????????????????????????????????????????????

1. CREATE
   ?
[Programata]  ? Can EDIT ?? or DELETE ???
   ?
2. CONFIRM
   ?
[Confirmata]  ? Can EDIT ?? or DELETE ???
   ?
3. COMPLETE
   ?
[Finalizata]  ? Cannot edit/delete, can add Notes
   ?
   ?? OR ?? [Absent]    ? No-show
   ?
   ?? OR ?? [Anulata]   ? Cancelled (via button or delete)
```

---

## ?? Permissions

| Role | Edit | Delete | Notes |
|------|------|--------|-------|
| **Admin** | ? All consultations | ? All consultations | ? All |
| **Lawyer** | ? Own + firm consultations | ? Own + firm consultations | ? All |
| **Secretary** | ? All consultations | ? Cannot delete | ? All |
| **Client** | ? No access | ? No access | ? No access |

**Note:** Permission enforcement should be added to backend endpoints (future enhancement).

---

## ? Verification Checklist

After edit/delete:

- [ ] ? Consultation list updated
- [ ] ? Lead status correct
- [ ] ? Activity logged in lead timeline
- [ ] ? Calendar events updated
- [ ] ? Lawyer notified (if changed)
- [ ] ? Client notified (if email enabled)
- [ ] ? No duplicate consultations created
- [ ] ? Availability recalculated for lawyer

---

## ?? Support

**Issues:**
- Cannot edit consultation ? Check consultation status (must be Programata/Confirmata)
- "Scheduling conflict" error ? Choose different time from available slots
- Delete not working ? Check if consultation is already cancelled
- Changes not saving ? Check browser console for errors

**Contact:**
- ?? Email: support@legalro.ro
- ?? In-app chat: Click bubble icon
- ?? Phone: +40 21 123 4567

---

*Edit/Delete Consultations Feature*  
*Added: March 2026*  
*Version: 1.1*  
*LegalRO Case Management System*

---

**? Feature complete and ready to use!** ??
