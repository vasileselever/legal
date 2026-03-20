# ?? Manual Frontend UI Testing Guide

## ? **Your React UI is Ready!**

I've confirmed you have a React + TypeScript + Vite project at:
```
C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui
```

**What you have:**
- ? React 19.2.4
- ? TypeScript 5.9.3
- ? Vite 8.0.0 (Build tool)
- ? Basic project structure

---

## ?? **Quick Start - Run Your React UI**

### **Step 1: Install Dependencies** (If not done)

```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui
npm install
```

### **Step 2: Start the Development Server**

```powershell
npm run dev
```

**Expected Output:**
```
  VITE v8.0.0  ready in XXX ms

  ?  Local:   http://localhost:5173/
  ?  Network: use --host to expose
  ?  press h + enter to show help
```

### **Step 3: Open in Browser**

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the default Vite + React welcome page! ??

---

## ?? **Manual UI Testing Checklist**

Now let's test your frontend UI step by step!

---

## ?? **Test Suite 1: Basic Functionality**

### ? **Test 1.1: Application Loads**

**Steps:**
1. Open `http://localhost:5173`
2. **Verify:**
   - Page loads without errors
   - You see React + Vite logos
   - "Vite + React" heading is displayed
   - Counter button is visible

**Expected Result:**
- ? Page loads successfully
- ? No console errors (Press F12 to check)
- ? All elements are visible

**Screenshot Location:** `docs/test-screenshots/test-1-1-app-loads.png`

---

### ? **Test 1.2: Interactive Elements Work**

**Steps:**
1. Click the "count is 0" button
2. **Verify:** Counter increments to 1
3. Click again
4. **Verify:** Counter increments to 2

**Expected Result:**
- ? Button is clickable
- ? Counter updates correctly
- ? No console errors

---

### ? **Test 1.3: Responsive Design**

**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected Result:**
- ? Layout adjusts to screen size
- ? No horizontal scrolling on mobile
- ? All elements remain accessible

---

## ?? **Test Suite 2: API Integration (After You Add Components)**

### ? **Test 2.1: API Connection**

Once you add API calls to your UI, test:

**Steps:**
1. Ensure backend API is running:
   ```powershell
   # Terminal 1
   cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
   dotnet run --launch-profile https
   ```

2. Start React app:
   ```powershell
   # Terminal 2
   cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui
   npm run dev
   ```

3. Open browser console (F12)
4. **Verify:**
   - No CORS errors
   - API calls succeed
   - Data loads correctly

**Expected Result:**
- ? React app connects to API at `https://localhost:5001`
- ? No CORS errors
- ? Data displays correctly

---

### ? **Test 2.2: Create Lead Form (When Implemented)**

**Steps:**
1. Navigate to create lead form
2. Fill in all required fields:
   - Name: "Test Lead"
   - Email: "test@example.com"
   - Phone: "+40721234567"
   - Practice Area: "Family Law"
   - Description: "Test description"
   - Urgency: "High"
   - Consent checkboxes: ? Both
3. Click "Submit" or "Create Lead"
4. **Verify:**
   - Form validates input
   - Success message appears
   - Lead appears in list
   - Score is calculated

**Expected Result:**
- ? Form submits successfully
- ? Success notification shown
- ? Lead appears in dashboard
- ? Lead score displayed (e.g., 77/100)

---

### ? **Test 2.3: Leads List/Dashboard (When Implemented)**

**Steps:**
1. Navigate to leads dashboard
2. **Verify:**
   - All leads are displayed
   - Lead scores are shown (HOT/WARM/COLD badges)
   - Status badges are correct
   - Filtering works (by status, source, score)
   - Pagination works
   - Search functionality works

**Expected Result:**
- ? Leads list loads
- ? Sorting works
- ? Filtering works
- ? Search works
- ? Pagination works

---

### ? **Test 2.4: Lead Details Page (When Implemented)**

**Steps:**
1. Click on a lead from the list
2. **Verify Lead Details Display:**
   - Lead name
   - Contact information (email, phone)
   - Lead score with badge (HOT/WARM/COLD)
   - Status badge
   - Practice area
   - Description
   - Created date
   - Assigned lawyer (if any)
3. **Verify Activity Timeline:**
   - Lead created activity
   - Conflict check initiated
   - Status changes
   - Timestamps are correct
4. **Verify Related Data:**
   - Conversations count
   - Consultations count
   - Documents count

**Expected Result:**
- ? All lead information displays correctly
- ? Timeline shows recent activities
- ? Counts are accurate
- ? Badges display correctly

---

## ?? **Test Suite 3: UI/UX Testing**

### ? **Test 3.1: Visual Design**

**Steps:**
1. Check color scheme consistency
2. Verify font consistency
3. Check spacing and alignment
4. Verify button styles

**Expected Result:**
- ? Professional color scheme (blue for legal)
- ? Consistent typography
- ? Proper spacing
- ? Buttons have hover states

---

### ? **Test 3.2: Loading States**

**Steps:**
1. Slow down network (DevTools > Network > Throttling)
2. Navigate to a page that loads data
3. **Verify:**
   - Loading spinner appears
   - "Loading..." message shown
   - No content flash before loading

**Expected Result:**
- ? Loading indicators work
- ? Content doesn't flash
- ? Smooth transitions

---

### ? **Test 3.3: Error Handling**

**Steps:**
1. Stop the backend API
2. Try to create a lead
3. **Verify:**
   - Error message appears
   - Message is user-friendly
   - User can retry
4. Restart API
5. Retry the action
6. **Verify:** Success

**Expected Result:**
- ? Errors are caught and displayed
- ? Messages are clear
- ? Recovery is possible

---

### ? **Test 3.4: Form Validation**

**Steps:**
1. Try to submit a form without filling required fields
2. **Verify:**
   - Validation errors appear
   - Fields are highlighted
   - Error messages are clear
3. Enter invalid data (e.g., invalid email)
4. **Verify:** Validation catches it
5. Fill form correctly
6. **Verify:** Validation passes

**Expected Result:**
- ? Required field validation works
- ? Format validation works
- ? Error messages are helpful
- ? Valid data is accepted

---

## ?? **Test Suite 4: Security & Privacy**

### ? **Test 4.1: GDPR Consent**

**Steps:**
1. Open create lead form
2. **Verify:**
   - Consent checkboxes are present
   - They are required
   - Cannot submit without consent
3. Uncheck consents
4. Try to submit
5. **Verify:** Form prevents submission

**Expected Result:**
- ? GDPR consent required
- ? Form cannot be submitted without consent
- ? Clear consent language

---

### ? **Test 4.2: Data Display**

**Steps:**
1. Check if sensitive data is displayed appropriately
2. **Verify:**
   - Phone numbers are formatted
   - Emails are formatted
   - No sensitive data in URLs
   - No data leaks in console

**Expected Result:**
- ? Data is displayed securely
- ? No sensitive info in URLs or console

---

## ?? **Test Suite 5: Cross-Browser Testing**

### ? **Test 5.1: Chrome**

**Steps:**
1. Open `http://localhost:5173` in Chrome
2. Test all functionality
3. **Verify:** Everything works

**Expected Result:**
- ? All features work in Chrome

---

### ? **Test 5.2: Firefox**

**Steps:**
1. Open `http://localhost:5173` in Firefox
2. Test all functionality
3. **Verify:** Everything works

**Expected Result:**
- ? All features work in Firefox

---

### ? **Test 5.3: Edge**

**Steps:**
1. Open `http://localhost:5173` in Edge
2. Test all functionality
3. **Verify:** Everything works

**Expected Result:**
- ? All features work in Edge

---

## ?? **Test Suite 6: End-to-End User Flows**

### ? **Test 6.1: Complete Lead Creation Flow**

**User Story:** *As a potential client, I want to submit my legal inquiry through the website.*

**Steps:**
1. Open public intake form
2. Fill in all details:
   - Personal information
   - Legal issue description
   - Preferred contact method
   - Budget range
   - Consent checkboxes
3. Submit form
4. **Verify:**
   - Success message appears
   - Confirmation email sent (if implemented)
   - Lead appears in admin dashboard
   - Lead score is calculated
   - Conflict check initiated

**Expected Result:**
- ? Lead created successfully
- ? Score: ~77/100 (for complete info)
- ? Status: "New"
- ? Conflict check: "Pending"

---

### ? **Test 6.2: Lead Management Flow (Admin)**

**User Story:** *As a lawyer, I want to review and manage new leads.*

**Steps:**
1. Log in to admin dashboard (when auth is added)
2. View leads list
3. Filter by "New" status
4. Click on a high-score lead (HOT badge)
5. Review lead details
6. Assign to a lawyer
7. Change status to "Contacted"
8. Add a note
9. Schedule consultation
10. **Verify all changes are saved**

**Expected Result:**
- ? Lead updated successfully
- ? Activity logged
- ? Consultation scheduled
- ? Timeline updated

---

### ? **Test 6.3: Consultation Scheduling Flow**

**User Story:** *As a lawyer, I want to schedule a consultation with a lead.*

**Steps:**
1. Open lead details
2. Click "Schedule Consultation"
3. Select date and time
4. Choose consultation type (Phone/Video/In-person)
5. Add preparation notes
6. Save
7. **Verify:**
   - Consultation appears in calendar
   - Lead notified (if implemented)
   - Reminder set

**Expected Result:**
- ? Consultation scheduled
- ? Calendar updated
- ? Reminders set

---

## ?? **Test Suite 7: Bug Hunting**

### ? **Test 7.1: Edge Cases**

**Test these scenarios:**

1. **Empty States:**
   - No leads in database
   - No consultations scheduled
   - No activities logged
   - **Verify:** Proper empty state messages

2. **Maximum Length Inputs:**
   - Very long names (500 chars)
   - Very long descriptions (10,000 chars)
   - **Verify:** Handled gracefully

3. **Special Characters:**
   - Names with accents: "?tefan ?ig?u"
   - Emails with + or .: "test+user@example.com"
   - Phone with different formats
   - **Verify:** Accepted correctly

4. **Boundary Values:**
   - Lead score 0
   - Lead score 100
   - Very old dates
   - Future dates
   - **Verify:** Display correctly

**Expected Result:**
- ? All edge cases handled
- ? No crashes
- ? Proper error messages

---

### ? **Test 7.2: Rapid Actions**

**Steps:**
1. Click buttons rapidly
2. Submit forms multiple times
3. Navigate quickly between pages
4. **Verify:**
   - No duplicate submissions
   - No race conditions
   - Proper loading states

**Expected Result:**
- ? No duplicate data
- ? Proper throttling/debouncing
- ? Smooth experience

---

## ?? **Test Suite 8: Performance Testing**

### ? **Test 8.1: Load Time**

**Steps:**
1. Open DevTools > Network tab
2. Clear cache (Ctrl+Shift+Del)
3. Reload page (Ctrl+F5)
4. **Measure:**
   - Page load time
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)

**Expected Result:**
- ? Initial load < 2 seconds
- ? FCP < 1 second
- ? TTI < 3 seconds

---

### ? **Test 8.2: Large Data Sets**

**Steps:**
1. Create 100+ test leads (use script)
2. Load leads dashboard
3. **Verify:**
   - Page loads without lag
   - Scrolling is smooth
   - Pagination works
   - Filtering is fast

**Expected Result:**
- ? Handles large datasets
- ? Smooth performance
- ? Proper pagination

---

## ?? **Testing Documentation Template**

Use this template to document your tests:

```markdown
## Test: [Test Name]

**Date:** [YYYY-MM-DD]
**Tester:** [Your Name]
**Environment:** [Development/Staging/Production]
**Browser:** [Chrome 120 / Firefox 115 / etc.]

### Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Result:
- [Expected outcome]

### Actual Result:
- [What actually happened]

### Status: ? PASS / ? FAIL

### Screenshots:
- [screenshot-1.png]
- [screenshot-2.png]

### Notes:
- [Any additional observations]

### Issues Found:
- [Issue #1: Description]
- [Issue #2: Description]
```

---

## ?? **Quick Testing Checklist**

Before deploying to production, ensure all these pass:

### **Critical Tests ?**
- [ ] Application loads without errors
- [ ] All forms submit correctly
- [ ] All API calls succeed
- [ ] Data displays accurately
- [ ] Authentication works (when added)
- [ ] GDPR consent enforced
- [ ] No console errors
- [ ] No CORS errors

### **Important Tests ??**
- [ ] Responsive on mobile
- [ ] Works in all major browsers
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Validation works
- [ ] Navigation works
- [ ] Search/filtering works
- [ ] Pagination works

### **Nice to Have ?**
- [ ] Animations are smooth
- [ ] Colors are consistent
- [ ] Typography is consistent
- [ ] Icons render correctly
- [ ] Tooltips work
- [ ] Keyboard navigation works
- [ ] Accessibility compliant

---

## ?? **How to Start Testing NOW**

### **1. Start Both Servers**

**Terminal 1 - Backend API:**
```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
dotnet run --launch-profile https
```

**Terminal 2 - Frontend UI:**
```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui
npm run dev
```

### **2. Open Both in Browser**

- **Frontend:** `http://localhost:5173`
- **Backend Swagger:** `https://localhost:5001/swagger`

### **3. Start with Test Suite 1**

Begin with **Test 1.1** (Application Loads) and work your way through each test suite.

### **4. Document Everything**

Take screenshots, note issues, and use the testing template above.

---

## ?? **Testing Tips**

1. **Test One Thing at a Time**
   - Focus on one feature or flow
   - Don't try to test everything at once

2. **Use Real Data**
   - Test with realistic scenarios
   - Romanian names, addresses, phone numbers

3. **Break Things on Purpose**
   - Try to break the app
   - Enter invalid data
   - Test edge cases

4. **Think Like a User**
   - Would this confuse a potential client?
   - Is the flow intuitive?
   - Are error messages helpful?

5. **Document Everything**
   - Take screenshots
   - Note issues immediately
   - Record steps to reproduce bugs

---

## ?? **Next Steps**

1. ? **Start with basic testing** (Test Suite 1)
2. ? **Build your UI components** (refer to `UI_COMPLETE_IMPLEMENTATION_GUIDE.md`)
3. ? **Test as you build** (Test Suite 2-3)
4. ? **Do end-to-end testing** (Test Suite 6)
5. ? **Performance testing** (Test Suite 8)
6. ? **Fix any issues found**
7. ? **Deploy to production!**

---

## ?? **You're Ready to Test!**

Your React UI is set up and ready. Start with **Test Suite 1** to verify the basic setup, then build your components and continue testing!

**Good luck with testing!** ??

---

*Manual Frontend UI Testing Guide*  
*Version 1.0*  
*Last Updated: March 16, 2026*
