# FORGE User Manual
## Where Concepts Become Systems

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Creating Your First Project](#creating-your-first-project)
3. [Working with Projects](#working-with-projects)
4. [Conversational Iteration](#conversational-iteration)
5. [File Upload](#file-upload)
6. [Viewing and Exporting Code](#viewing-and-exporting-code)
7. [Settings and Configuration](#settings-and-configuration)
8. [Understanding the Build Process](#understanding-the-build-process)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Getting Started

### What is FORGE?
FORGE is an AI-powered code generation workbench that converts natural language specifications into working code repositories with automated testing. Think of it as your AI pair programmer that can build entire applications from descriptions.

### Main Interface Overview

#### Left Pane
- **Projects List**: Shows all your projects with dates
- **Build Settings**: Collapsible form for creating new projects or modifying existing ones
- **Conversational Mode**: Chat interface at the bottom for iterative improvements

#### Right Pane (Tabs)
- **Build Process**: Watch FORGE plan, code, and test in real-time
- **Artifacts**: View and download generated code
- **Jobs**: See all build history
- **Console**: Raw execution logs

### First Launch
1. Open FORGE
2. Click the **⚙️ Settings** icon (top left)
3. Configure your LLM provider:
   - **For OpenAI**: Enter your API key
   - **For LM Studio**: Set the local server URL (default: http://localhost:1234/v1)
4. Choose your provider: AUTO, LMSTUDIO, or OPENAI

---

## Creating Your First Project

### Method 1: Type Your Specification

1. In the left pane, ensure **"New Project"** button is highlighted (orange)
2. Enter a **Project Name** (e.g., "todo-app")
3. In the **Specification** textarea, describe what you want:
   ```
   Build a CLI todo application in Python that:
   - Adds tasks to a JSON file
   - Lists all tasks
   - Marks tasks as complete
   - Includes pytest tests for all functions
   ```
4. Click **"Create Project"**

### Method 2: Upload a Specification File

1. Click the **📁 Upload File** button (next to "Specification" label)
2. Select a `.txt`, `.md`, or `.docx` file
3. File content automatically fills the specification field
4. Click **"Create Project"**

### What Happens Next?
FORGE will:
1. **Plan** - Create a structured plan for your application
2. **Code** - Generate all necessary files
3. **Test** - Run automated tests
4. **Fix** - Automatically fix any test failures (up to 3 iterations)

Watch the **Build Process** tab in real-time to see each step!

---

## Working with Projects

### Viewing Your Projects
All projects appear in the **Projects** panel in the left pane. Each shows:
- Project name
- Last updated date

### Selecting a Project
Click any project in the list to:
- Select it (turns orange)
- Auto-collapse Build Settings
- Activate Conversational Mode
- Enable "Modify Selected" button

### Project States
- **Queued**: Waiting to start
- **Running**: Currently being built
- **Succeeded**: Build completed successfully ✅
- **Failed**: Build had errors ❌

---

## Conversational Iteration

### What is Conversational Mode?
After creating a project, you can chat with FORGE to make changes. FORGE reads your existing code and conversation history to make intelligent, context-aware modifications.

### How to Use It

1. **Select a project** from the Projects list
2. **Scroll to Conversational Mode** at the bottom of the left pane
3. **Type your request** in the large textarea, for example:
   - "Add error handling to all functions"
   - "Make the UI responsive for mobile"
   - "Add logging with timestamps"
   - "Create a README with installation instructions"

4. **Press Enter** or click **"🚀 Send Message"**

### Tips for Better Results
- **Be specific**: "Add input validation for email addresses" vs "make it better"
- **One change at a time**: Easier for FORGE to handle
- **Mention files**: "In app.py, add error handling" for targeted changes
- **Ask questions**: "What does the calculate_total function do?"

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line in message

---

## File Upload

### Supported Formats
- **`.txt`** - Plain text files
- **`.md`** - Markdown files
- **`.docx`** - Microsoft Word documents

### How to Upload

1. Expand **Build Settings** (if collapsed)
2. Look for the **Specification** or **Modification Request** field
3. Click **📁 Upload File** button
4. Select your file
5. Content automatically populates the text field
6. Edit if needed, then create/modify project

### Use Cases
- Upload existing requirements documents
- Import MVP specifications from Word
- Load project briefs from clients
- Reuse previous spec templates

---

## Viewing and Exporting Code

### Viewing Generated Code

1. Go to **Artifacts tab** (right pane)
2. See all generated files in the sidebar
3. Click any file to view its contents
4. Code viewer shows syntax-highlighted content

### Exporting Your Code

#### Option 1: Download as ZIP ⭐ Recommended
1. Go to **Artifacts tab**
2. Click **"📥 Download as ZIP"** button
3. Extract the ZIP anywhere on your computer
4. Ready to run or deploy!

#### Option 2: Copy Workspace Path
1. Go to **Artifacts tab**
2. Click **"📂 Copy Workspace Path"** button
3. Path copied to clipboard
4. Navigate in File Explorer
5. Copy files where you need them

#### Option 3: Direct Filesystem Access
- **Windows**: `C:\Users\YourUsername\AppData\Roaming\FORGE\workspaces\`
- **Mac/Linux**: `~/.forge/workspaces/`
- Find your project folder: `{project-name}_{unique-id}/`

### Understanding the Workspace Location
The workspace path shown in Artifacts tab tells you exactly where FORGE stored your generated code. This is useful for:
- Running the code directly
- Version control (git)
- Opening in your favorite IDE
- Deploying to servers

---

## Settings and Configuration

### Opening Settings
Click the **⚙️ Settings** icon in the top-left corner.

### LM Studio Configuration
**For local LLM (free, private):**
1. Install [LM Studio](https://lmstudio.ai/)
2. Download a compatible model
3. Start the local server
4. In FORGE Settings, set **LM Studio URL**: `http://localhost:1234/v1`
5. Select **LMSTUDIO** provider

### OpenAI Configuration
**For cloud LLM (fast, high-quality):**
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. In FORGE Settings, enter your **OpenAI API Key**
3. Select **OPENAI** provider

### Provider Selection
- **AUTO**: Prefers LM Studio in LOCAL mode, OpenAI in CLOUD mode
- **LMSTUDIO**: Always use local LLM (must have LM Studio running)
- **OPENAI**: Always use OpenAI API (requires API key)

### Settings Storage
- Settings are **encrypted** and stored locally
- API keys are **never logged** or exposed
- Encryption key stored in: `%APPDATA%\FORGE\.forge_key`

---

## Understanding the Build Process

### Build Process Tab
Watch FORGE work in real-time:

#### 1. Planning Phase
- FORGE analyzes your specification
- Creates structured plan with files and tests
- **Status**: Blue "PLAN" entries

#### 2. Coding Phase
- Generates all code files
- Shows file paths and full content
- **Status**: Green "FILE" entries

#### 3. Testing Phase
- Runs pytest tests automatically
- Shows test results
- **Status**: Red/Green "TEST" entries

#### 4. Fixing Phase (if needed)
- Analyzes test failures
- Makes targeted fixes
- Retests (up to 3 iterations)
- **Status**: Orange "FIX" entries

### Build States

**Queued**: Job waiting in queue
- FORGE processes one job at a time
- Your job will start soon

**Running**: Active build in progress
- Watch the Build Process tab
- See real-time progress

**Succeeded**: Build completed successfully
- All tests passed ✅
- Code ready in Artifacts tab
- Download or view your project!

**Failed**: Build encountered errors
- Check Console tab for details
- Review the specification
- Try again with clearer requirements

---

## Troubleshooting

### "Build Failed" - What to Do?

1. **Check Console tab** for error messages
2. **Review your specification**:
   - Is it clear and specific?
   - Are requirements realistic for a single build?
   - Try breaking complex specs into smaller projects
3. **Try again** with refined specification
4. **Use Conversational Mode** to ask FORGE to fix specific issues

### "No files generated"

**Cause**: Build didn't complete successfully
**Solution**: Check Jobs tab status, review Console for errors

### "Upload File Failed"

**Cause**: Unsupported file format or encoding
**Solution**: 
- Use `.txt`, `.md`, or `.docx` files only
- Ensure UTF-8 encoding for text files
- Try copying content manually if upload fails

### "LM Studio not responding"

**Cause**: Local server not running
**Solution**:
1. Open LM Studio application
2. Go to "Local Server" tab
3. Click "Start Server"
4. Verify server running on port 1234
5. Try FORGE again

### "OpenAI API Error"

**Possible Causes**:
- Invalid API key
- Insufficient credits
- Network connectivity issues

**Solution**:
1. Verify API key in Settings
2. Check [OpenAI usage](https://platform.openai.com/usage)
3. Test internet connection
4. Try again

### Slow Build Times

**With OpenAI**: Should be 5-30 seconds total
- If slower, check internet speed

**With LM Studio**: May take 10-120 seconds
- Depends on your GPU/CPU
- Larger models are slower
- Normal for local processing

---

## FAQ

### General Questions

**Q: Is my code private?**
A: 
- **LM Studio**: Yes, everything stays on your machine
- **OpenAI**: Specs are sent to OpenAI API, but not used for training

**Q: How much does it cost?**
A:
- FORGE itself is free
- **LM Studio**: Free (requires local hardware)
- **OpenAI**: ~$0.15-$0.60 per project depending on complexity

**Q: Can I use FORGE offline?**
A: Yes, with LM Studio (local LLM). No internet required after initial setup.

**Q: What languages does FORGE support?**
A: FORGE can generate code in any language. Specify in your spec: "Build a web app in TypeScript" or "Create a CLI in Go"

### Project Questions

**Q: Can I modify a project multiple times?**
A: Yes! That's the point of Conversational Mode. Select a project and keep chatting to refine it.

**Q: Can I export to GitHub?**
A: Yes! Download as ZIP, extract, then:
```bash
cd your-project
git init
git add .
git commit -m "Initial commit from FORGE"
git remote add origin your-repo-url
git push -u origin main
```

**Q: How do I run the generated code?**
A: 
1. Download as ZIP and extract
2. Follow the README in the generated code
3. Usually involves:
   - Installing dependencies (`pip install -r requirements.txt` or `npm install`)
   - Running the main file (`python main.py` or `npm start`)

**Q: Can FORGE build full-stack applications?**
A: Yes! Specify both frontend and backend in your spec:
```
Build a todo app with:
- React frontend with Tailwind CSS
- FastAPI backend with SQLite database
- REST API for CRUD operations
- pytest tests for backend
```

### Technical Questions

**Q: Where is my data stored?**
A:
- **Windows**: `C:\Users\YourUsername\AppData\Roaming\FORGE\`
- **Mac/Linux**: `~/.forge/`
- Contains: database, workspaces, encryption key

**Q: Can I change the workspace location?**
A: Yes, set environment variable:
```bash
FORGE_DATA_DIR=C:\YourCustomPath\FORGE
```

**Q: What models work with LM Studio?**
A: Compatible models include:
- Mistral 7B / Mixtral 8x7B
- Llama 3 8B / 70B
- Codestral
- DeepSeek Coder
- Any OpenAI-compatible model

**Q: Can I use both OpenAI and LM Studio?**
A: Yes! Switch between providers anytime in Settings. Great for balancing cost vs. speed.

### Build Process Questions

**Q: What are the iteration limits?**
A: FORGE will attempt to fix failing tests up to 3 times. After that, the build is marked as failed.

**Q: Can I cancel a running build?**
A: Currently, no. But builds timeout after 10 minutes automatically.

**Q: Why did my build fail after tests passed?**
A: Check Console tab. Possible causes:
- Runtime errors during verification
- Environment issues
- Syntax errors that pytest didn't catch

**Q: Can I see the LLM prompts?**
A: No, prompts are internal. But you can see the LLM's responses in the Build Process tab (plan, code, fixes).

---

## Quick Reference

### Keyboard Shortcuts
- **Conversational Mode**:
  - `Enter`: Send message
  - `Shift+Enter`: New line

### Common Tasks

**Create a new project:**
1. New Project button → Enter name → Enter spec → Create Project

**Modify existing project:**
1. Select project → Chat at bottom → Type changes → Send

**Download code:**
1. Artifacts tab → Download as ZIP

**Switch LLM provider:**
1. Settings ⚙️ → Choose provider → Save

**Upload specification:**
1. Build Settings → Upload File button → Select file

**View workspace location:**
1. Artifacts tab → Check "Workspace Location" box

---

## Getting Help

### In-App Help
- Click **Help** tab for searchable documentation
- Ask the LLM: "How do I upload a file?"
- Chat gets instant, context-aware answers

### Need More Help?
- Check the Build Process tab for clues
- Review Console logs for errors
- Try simpler specifications first
- Break complex projects into smaller steps

---

**FORGE — Where Concepts Become Systems** 🔥
