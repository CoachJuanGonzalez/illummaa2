# 📦 REPLIT UPLOAD - SIMPLE 2-STEP PROCESS

## 🎯 What You Need to Upload

You need to upload **2 files** to Replit:

1. **PDF File:** `3-bedroom-technical-plans.pdf` (already prepared for you)
2. **Prompt File:** `REPLIT-CHAT-PROMPT.md` (tells Replit what to do)

---

## 📍 WHERE TO FIND THE FILES

Both files are ready in this folder:
```
C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\documentation\
```

**Files to upload:**
- ✅ `REPLIT-CHAT-PROMPT.md` (instructions for Replit)
- ✅ `3-bedroom-technical-plans.pdf` (located in `../attached_assets/` folder)

---

## 🚀 HOW TO UPLOAD TO REPLIT

### **Method 1: Replit AI Chat (EASIEST)**

1. **Open your Replit project**
2. **Open Replit AI chat** (usually on the right side)
3. **Attach the PDF file:**
   - Click the "📎" (paperclip) attachment icon
   - Browse to: `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\attached_assets\3-bedroom-technical-plans.pdf`
   - Upload it
4. **Paste the prompt:**
   - Open `REPLIT-CHAT-PROMPT.md` in Notepad
   - Copy ALL the text
   - Paste into Replit AI chat
5. **Press Enter**
6. **Replit AI will:**
   - Upload the PDF to `attached_assets/` folder
   - Make the 2-line code change automatically
   - Test it for you

**Done!** ✅

---

### **Method 2: Manual Upload (ALTERNATIVE)**

If Replit AI doesn't work:

1. **Upload PDF manually:**
   - In Replit file explorer, go to `attached_assets/` folder
   - Click "⋮" (three dots) → "Upload file"
   - Select: `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\attached_assets\3-bedroom-technical-plans.pdf`

2. **Edit the code manually:**
   - Open file: `client/src/pages/model-3br-executive.tsx`
   - Follow the instructions in `REPLIT-CHAT-PROMPT.md`
   - Add the 2 lines as shown

3. **Test:**
   - Click "Run" in Replit
   - Navigate to `/models/3br-executive`
   - Click "Technical Plans (PDF)" tab
   - Verify PDF opens

---

## ✅ VERIFICATION CHECKLIST

After upload, verify:

- [ ] PDF file exists at: `attached_assets/3-bedroom-technical-plans.pdf`
- [ ] File size is ~1.4 MB
- [ ] Code changes applied to `model-3br-executive.tsx`
- [ ] TypeScript compiles without errors
- [ ] Site runs without errors
- [ ] "Technical Plans (PDF)" tab visible on page
- [ ] Clicking tab shows green card with 📐 icon
- [ ] Clicking card opens PDF in new tab

---

## 🆘 IF SOMETHING GOES WRONG

**PDF not found error?**
- Check PDF is in `attached_assets/` folder (not root folder)
- Check filename is exactly: `3-bedroom-technical-plans.pdf` (no spaces)

**TypeScript errors?**
- Check you added `const technicalPlansPDF = "/attached_assets/3-bedroom-technical-plans.pdf";`
- Check it's BEFORE `export default function`

**Tab doesn't appear?**
- Check you added the technical plans object to the floorPlans array
- Check for syntax errors (missing commas, brackets)

**Need to rollback?**
- In Replit: Click "History" → Revert to previous version
- Delete `3-bedroom-technical-plans.pdf` from `attached_assets/`

---

## 📊 WHAT THIS DOES

**Before:**
- 3BR Executive page shows 3 floor plan tabs (2D, 3D, Dimensions)

**After:**
- 3BR Executive page shows 4 floor plan tabs
- New tab: "Technical Plans (PDF)"
- Clicking it opens the 7-page architectural drawing PDF

**Risk:** 🟢 **LOW** - Only 2 lines of code changed, zero breaking changes

---

## 🎉 EXPECTED RESULT

Users visiting your 3BR Executive page can now:
1. Scroll to "Floor Plans & Specifications"
2. Click "Technical Plans (PDF)" tab
3. View the complete architectural drawings
4. Download or print the PDF if needed

**Simple, safe, and effective!** ✅
