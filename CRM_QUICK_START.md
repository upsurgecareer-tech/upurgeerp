# 🚀 CRM Module - Quick Start Guide

## ✅ Kya Kya Banaya Hai

### **1. CRM Dashboard** 📊
- Total Leads, New Today, Hot Leads metrics
- Lead trend chart (7 days)
- Pipeline distribution (Pie chart)
- Source performance (Bar chart)
- Recent leads list
- Today's follow-ups
- Quick action buttons

**URL:** `http://localhost:3001/crm/dashboard`

---

### **2. Lead Kanban Board** 📋
- Drag & drop leads between stages
- 6 stages: New → Contacted → Qualified → Negotiation → Converted → Lost
- Color-coded columns
- Quick actions on each card (Call, WhatsApp, Email, View)
- Auto-save on drag

**URL:** `http://localhost:3001/crm/kanban`

---

### **3. Lead Detail Page** 👤
- Complete lead profile
- Edit lead information
- Activity timeline
- Follow-up history
- Notes section
- Quick actions sidebar
- Schedule follow-up
- Add notes
- Convert to student

**URL:** `http://localhost:3001/crm/lead/:id`

---

## 🔧 Installation Steps

### **Step 1: Install New Package**
```bash
cd d:\webapp\frontend
npm install
```

### **Step 2: Start Backend**
```bash
cd d:\webapp\backend
npm run dev
```

### **Step 3: Start Frontend**
```bash
cd d:\webapp\frontend
npm run dev
```

### **Step 4: Login**
```
URL: http://localhost:3001
Email: admin@upsurgeerp.com
Password: admin123
```

---

## 📱 Navigation

```
Menu → CRM ▼
  ├── CRM Dashboard      (Overview)
  ├── Leads              (Add new lead)
  ├── Leads List         (Table view)
  ├── Kanban Board       (Drag & drop)
  ├── Follow Ups         (Schedule & manage)
  └── Analytics          (Charts & reports)
```

---

## 🎯 Key Features

### **CRM Dashboard:**
- ✅ 5 Metric cards
- ✅ 3 Charts (Line, Pie, Bar)
- ✅ Recent leads list
- ✅ Today's follow-ups
- ✅ Quick actions

### **Kanban Board:**
- ✅ Drag & drop
- ✅ 6 stage columns
- ✅ Color-coded
- ✅ Quick actions per card
- ✅ Lead count per stage

### **Lead Detail:**
- ✅ Full profile view
- ✅ Inline editing
- ✅ 3 tabs (Activities, Follow-ups, Notes)
- ✅ Quick action sidebar
- ✅ Schedule follow-up
- ✅ Add notes

---

## 🎨 Quick Actions

### **From Kanban Card:**
- 📞 Call → Opens phone dialer
- 💬 WhatsApp → Opens WhatsApp web
- 📧 Email → Opens email client
- 👁️ View → Opens lead detail

### **From Lead Detail:**
- 📞 Call Lead
- 💬 WhatsApp Message
- 📧 Send Email
- 📅 Schedule Follow-up
- 📝 Add Note
- 📎 Upload Document
- ✅ Convert to Student

---

## 📊 Menu Structure

```
🎓 UpsurgeERP
├── 📊 Dashboard
├── 📈 CRM ▼
│   ├── 📊 CRM Dashboard
│   ├── 👥 Leads
│   ├── 📋 Leads List
│   ├── 📊 Kanban Board      ← NEW!
│   ├── 📅 Follow Ups
│   └── 📈 Analytics
├── 🎓 Students ▼
├── 📚 Academics ▼
├── 📝 Examinations ▼
├── 🎥 LMS ▼
├── 💰 Finance ▼
├── 📖 Resources ▼
├── 💼 Staff
├── 📧 Communication
└── 📊 Reports
```

---

## 🔥 Usage Examples

### **Example 1: Add New Lead**
1. Click "CRM" → "Leads"
2. Click "Add Lead" button
3. Fill form (Name, Mobile, Email, Course, Source, Stage)
4. Click "Create Lead"

### **Example 2: Move Lead in Pipeline**
1. Click "CRM" → "Kanban Board"
2. Find lead card in "New" column
3. Drag card to "Contacted" column
4. Auto-saved!

### **Example 3: Schedule Follow-up**
1. Click "CRM" → "Leads List"
2. Click eye icon on any lead
3. Click "Schedule Follow-up" button
4. Select type, date/time, add notes
5. Click "Schedule"

### **Example 4: View Lead Details**
1. Click "CRM" → "Kanban Board"
2. Click eye icon on any lead card
3. View complete profile
4. Use quick actions (Call, WhatsApp, Email)

---

## 🎨 Color Codes

- **New:** 🔵 Blue
- **Contacted:** 🟠 Orange
- **Qualified:** 🟣 Purple
- **Negotiation:** 🟡 Yellow
- **Converted:** 🟢 Green
- **Lost:** 🔴 Red

---

## 📝 Files Created/Modified

### **New Files:**
1. `frontend/src/pages/CRM/CRMDashboard.jsx`
2. `frontend/src/pages/CRM/LeadKanban.jsx`
3. `frontend/src/pages/CRM/LeadDetail.jsx`
4. `CRM_IMPLEMENTATION.md`
5. `CRM_QUICK_START.md`

### **Modified Files:**
1. `frontend/package.json` (Added react-beautiful-dnd)
2. `frontend/src/App.jsx` (Added routes)
3. `frontend/src/components/Layout.jsx` (Added menu items)
4. `frontend/src/pages/CRM/LeadsList.jsx` (Added view button)
5. `backend/src/controllers/leadController.js` (Added APIs)
6. `backend/src/routes/leads.js` (Added routes)

---

## 🐛 Troubleshooting

### **Issue: Drag & drop not working**
**Solution:** Run `npm install` in frontend folder

### **Issue: Lead detail page not loading**
**Solution:** Check if lead ID exists in database

### **Issue: Charts not showing**
**Solution:** Make sure backend is running and returning data

### **Issue: Quick actions not working**
**Solution:** Check browser console for errors

---

## 📞 Support

For issues or questions:
- Check `CRM_IMPLEMENTATION.md` for detailed guide
- Check browser console for errors
- Check backend logs for API errors

---

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Start backend & frontend
3. ✅ Login to system
4. ✅ Navigate to CRM Dashboard
5. ✅ Try Kanban Board
6. ✅ View lead details
7. ✅ Schedule follow-ups
8. ✅ Add notes

---

**Happy CRM Management! 🚀**
