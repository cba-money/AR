# A/R System
The A/R system currently works with two applications, the A/R Formatter and the A/R Processor. The formatter is currently a desktop app, built with Electron, that uses Node.js and ExcelJS to process existing Weekly 7 Spreadsheets. It creates a new file of only the isolated contracts (within a given range), flattens all formulas, and adds a blank top row (this is necessary due to the AR Proc app). The processor is a Python script, running in a Flask server, which takes in the formatted files, calculates outstanding Accounts Receivable, and produces an output PDF for download. 

---

# A/R Desktop Suite – Unified Development Plan
## Project Overview

The new A/R system will consolidate the existing two-stage workflow into a single desktop application capable of processing one or many Weekly 7 files without relying on a web server. The application will retain the current formatting functionality while integrating the Accounts Receivable processing engine directly into the desktop application.

This redesign eliminates the Flask web application entirely, simplifies deployment, enables offline operation, and introduces true batch processing.

## Existing Workflow

```
Weekly 7.xlsx
      │
      ▼
A/R Formatter (Electron)
      │
      ▼
Formatted Weekly 7.xlsx
      │
      ▼
Upload to Flask Web App
      │
      ▼
Python Processing
      │
      ▼
Generated PDF
```

Problems:
* Two separate applications
* Requires running a local web server
* Files must be manually uploaded
* Only processes one report at a time
* More complicated deployment
* Python runtime separated from desktop app

## Proposed Workflow

```
Select Folder
       │
       ▼
Desktop Application
       │
       ├───────────────┐
       │               │
Format Weekly 7    Calculate A/R
       │               │
       └───────┬───────┘
               ▼
Generate PDFs
               │
               ▼
Output Folder
```

Everything occurs inside one application.

No browser.

No Flask.

No uploads.

## Primary Objectives

The new application should:

* Merge [Formatter](https://github.com/tyler-ruff-cba/ar-formatter) and [Processor](https://github.com/tyler-ruff-cba/ar-app) into one application.
* Process all Weekly 7 files in one batch
* Display A/R totals with export download, and provide a file of all calculated totals (along with respective admin).
* Automatically generate PDFs
* Operate completely offline
* Require only one executable
* Preserve existing formatting logic
* Preserve existing Python A/R calculations

## Functional Requirements
1. Batch Processing
Instead of opening one spreadsheet:

```
Input Folder

John Weekly 7.xlsx
Mary Weekly 7.xlsx
Susan Weekly 7.xlsx
Mike Weekly 7.xlsx
...
```

The application processes every compatible spreadsheet automatically.

---

2. Integrated Formatter

Reuse the existing Electron formatter.

Responsibilities include:
* Parse Weekly 7 files
* Detect report date
* Isolate selected month range
* Copy formatting
* Flatten formulas
* Preserve currency formatting
* Insert blank header row
* Save temporary workbook

No changes to business logic should be necessary.

---

3. Integrated A/R Processor

After formatting:

```
Formatted Workbook

↓

Python Processing

↓

Outstanding A/R

↓

PDF
```

---

4. Automatic PDF Naming

The program should pull the Admin name/abbreviation from the input file.

We will also have a hard coded key filled with associations of admins names to abbreviations. 

This name will be used to create the output file names for the raw .xlsx as well as the .pdf export. 

Example:
```
HWG ar to mm.dd.yy.xlsx

WS ar to mm.dd.yy.xlsx

LSC ar to mm.dd.yy.xlsx
...

```

5. Progress Window

The purpose of the progress bar/window is to show elapsed time/remaining time. Also, the progress bar lets the user know that the processing has not frozen.

Example:

```
Processing...

██████████░░░░░░░ 58%

Current File:

Liberty Shield Weekly 7.xlsx

Completed:

14 / 24
```

6. Processing Log

```
✓ LSC Weekly 7.xlsx

✓ WT Weekly 7.xlsx

✓ HWG Weekly 7.xlsx

⚠ Veritas Weekly 7.xlsx

Missing worksheet

✓ David Weekly 7.xlsx
```

## User Interface

### Main Window

```
---------------------------------------

Accounts Receivable Processor

---------------------------------------

Input Folder

[ Browse ]

Output Folder

[ Browse ]

Date Range

[____________]

Example:

5/2026,6/2026,7/2026

☑ Keep formatted spreadsheets

☑ Generate PDFs

☑ Open folder when finished

---------------------------------------

Files Found:

24

---------------------------------------

[ Start Processing ]

---------------------------------------

Progress

███████████░░░░░

Current:

John Weekly 7.xlsx

---------------------------------------
```

## Architecture

```
Electron

│

├── Main Process

├── Renderer

├── Formatter Module (Node)

├── Processing Module (Python)

├── PDF Output

└── File Manager
```

## Python Integration Options
### Option 1 — Bundle Python Interpreter (Recommended)

Electron launches Python directly.

```
Electron

↓

python.exe

↓

process.py
```

Advantages:
* Existing code remains intact.
* Lowest development effort.
* Easier debugging.
* Simpler future maintenance.
* Business logic stays in Python.

Disadvantages:
* Installer size increases by approximately 30–60 MB.

### Option 2 — Convert Python to JavaScript

Rewrite:

```
Flask

↓

Pure Node

↓

Electron
```

Advantages:
* Smaller installation.
* Single language.

Disadvantages:
* Significant redevelopment.
* High testing burden.
* Increased risk of introducing calculation differences.

Given that the Python logic already exists and is trusted, this option is generally not recommended unless there is a compelling long-term reason to standardize on JavaScript.

## Planned File Structure
```
AR Processor

app/

renderer/

formatter/

python/

process.py

requirements.txt

runtime/

Python/

assets/

output/

temp/

main.js
```

## Processing Pipeline

```
Find Weekly 7

↓

Open Workbook

↓

Run Formatter

↓

Save Temporary Workbook

↓

Launch Python

↓

Calculate A/R

↓

Generate PDF

↓

Delete Temporary File

↓

Next Workbook
```

## Other Possible Enhancements

### Parallel Processing

Multiple reports processed simultaneously where system resources permit.

## Development Phases
### Phase 1: Project Foundation
* Create a new Electron application shell.
* Design the desktop UI and application layout.
* Integrate the existing formatter module.
* Add folder selection and file discovery.

### Phase 2: Python Integration
* Remove the Flask server dependency.
* Integrate the Python processing script for direct local execution.
* Capture progress, logging, and error output from the Python process.
* Bundle a Python interpreter with the application for distribution.

### Phase 3: Batch Processing
* Implement sequential processing of all compatible Weekly 7 files in a selected folder.
* Create temporary workspaces and clean up intermediate files automatically.
* Add robust error handling so individual failures do not halt the batch.

### Phase 4: User Experience
* Implement a progress bar, processing log, and status updates.
* Add configurable output options (keep formatted spreadsheets, generate PDFs, open output folder on completion).
* Validate user input and provide clear error messages.

### Phase 5: Packaging and Distribution
* Package the application using Electron Builder for Windows (and optionally macOS).
* Include the Python runtime and required dependencies in the installer.
* Verify the application operates fully offline with no external services required.