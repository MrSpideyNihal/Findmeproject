/**
 * parseExcel.ts
 *
 * Client-side Excel parser for the AIML Alumni Project sheets.
 *
 * Excel structure (per sheet):
 *  - Rows 0-7 are metadata/headers
 *  - Row 8 is the column header row
 *  - Row 9+ contains data
 *
 * A "project group" starts when a row has a non-empty Batch No. AND Title.
 * Subsequent rows without a Batch No./Title belong to the same group (members).
 *
 * Sheet 1 columns (13 cols): Sr.No | Batch No. | Roll No. | SEC | Student Name | Email | Mobile | Title | Remark | Guide | Alumni Details | 1st Remark | 2nd Remark
 * Sheet 2 columns (12 cols): Sr.No | Batch No. | Roll No. | Student Name | Email | Mobile | Title | Remark | Guide | Alumni Details | 1st Remark | 2nd Remark
 */

export interface ParsedMember {
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

export interface ParsedProject {
  title: string;
  groupName: string;
  batchName: string;
  abstract: string;
  githubUrl: string;
  youtubeUrl: string;
  mentorName: string;
  members: ParsedMember[];
  tags: string[];
  warnings: string[];
  _sheetName?: string;
}

/** Clean up cell value — trim whitespace and strip trailing newlines */
function clean(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[\r\n]+/g, ' ').trim();
}

/** Detect column layout for a given header row */
interface ColumnMap {
  batchNo: number;
  rollNo: number;
  section: number | null; // null if sheet doesn't have SEC column
  studentName: number;
  email: number;
  mobile: number;
  title: number;
  remark: number;
  guide: number;
  alumniDetails: number;
  remark1: number;
  remark2: number;
}

function detectColumns(headerRow: unknown[]): ColumnMap | null {
  const headers = headerRow.map((h) => clean(h).toLowerCase());

  // Check if there's a SEC column (Sheet 1 has it, Sheet 2 doesn't)
  const hasSEC = headers.some(
    (h) => h === 'sec' || h === 'section'
  );

  if (hasSEC) {
    // Sheet 1 layout: 13 columns
    return {
      batchNo: 1,
      rollNo: 2,
      section: 3,
      studentName: 4,
      email: 5,
      mobile: 6,
      title: 7,
      remark: 8,
      guide: 9,
      alumniDetails: 10,
      remark1: 11,
      remark2: 12,
    };
  } else {
    // Sheet 2 layout: 12 columns (no SEC)
    return {
      batchNo: 1,
      rollNo: 2,
      section: null,
      studentName: 3,
      email: 4,
      mobile: 5,
      title: 6,
      remark: 7,
      guide: 8,
      alumniDetails: 9,
      remark1: 10,
      remark2: 11,
    };
  }
}

/** Extract mentor name from the guide cell */
function extractMentorName(raw: string): string {
  // Guide cell is like "Dr. Archana Raut" or "Prof. Krupali Dhawale"
  return clean(raw);
}

/** Build a reasonable abstract from the available alumni remarks and title */
function buildAbstract(
  title: string,
  remark1: string,
  remark2: string
): string {
  const parts: string[] = [];

  if (remark1) parts.push(remark1);
  if (remark2) parts.push(remark2);

  if (parts.length === 0) {
    return `Project: ${title}. Details to be added.`;
  }

  return parts.join('\n\n');
}

/** Try to generate relevant tags from the project title */
function inferTags(title: string): string[] {
  const tagMap: Record<string, string[]> = {
    'ai': ['AI'],
    'machine learning': ['Machine Learning'],
    'deep learning': ['Deep Learning'],
    'cnn': ['CNN', 'Deep Learning'],
    'blockchain': ['Blockchain'],
    'iot': ['IoT'],
    'nlp': ['NLP'],
    'computer vision': ['Computer Vision'],
    'transfer learning': ['Transfer Learning'],
    'neural network': ['Neural Network'],
    'detection': ['Detection'],
    'prediction': ['Prediction'],
    'classification': ['Classification'],
    'chatbot': ['Chatbot'],
    'recommendation': ['Recommendation System'],
    'web': ['Web Development'],
    'mobile': ['Mobile App'],
    'flask': ['Flask'],
    'react': ['React'],
    'python': ['Python'],
    'eeg': ['EEG', 'Biomedical'],
    'cancer': ['Healthcare'],
    'medical': ['Healthcare'],
    'health': ['Healthcare'],
    'lung': ['Healthcare'],
    'crop': ['Agriculture'],
    'supply chain': ['Supply Chain'],
    'ar': ['AR'],
    'vr': ['VR'],
    'ocr': ['OCR'],
    'workout': ['Fitness'],
    'nutrition': ['Fitness'],
    'finance': ['Finance'],
    'education': ['Education'],
    'learning management': ['Education'],
  };

  const lower = title.toLowerCase();
  const tags = new Set<string>();

  for (const [keyword, tagValues] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) {
      tagValues.forEach((t) => tags.add(t));
    }
  }

  // Always add AIML as a tag since it's from the AIML department
  tags.add('AIML');

  return Array.from(tags).slice(0, 10);
}

/**
 * Parse all projects from a 2D array of Excel rows.
 * `rows` should be the full sheet data (header:1 format from SheetJS).
 */
export function parseSheet(
  rows: unknown[][],
  sheetName: string
): ParsedProject[] {
  // Find the header row (look for "Sr. No." or "Batch No.")
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (!row) continue;
    const firstCells = row.map((c) => clean(c).toLowerCase());
    if (
      firstCells.some((c) => c.includes('sr') && c.includes('no')) ||
      firstCells.some((c) => c.includes('batch') && c.includes('no'))
    ) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) return [];

  const cols = detectColumns(rows[headerIdx]);
  if (!cols) return [];

  const dataRows = rows.slice(headerIdx + 1);
  const projects: ParsedProject[] = [];
  let currentProject: ParsedProject | null = null;

  for (const row of dataRows) {
    if (!row || row.length === 0) continue;

    const batchNo = clean(row[cols.batchNo]);
    const title = clean(row[cols.title]);
    const studentName = clean(row[cols.studentName]);
    const email = clean(row[cols.email]);

    // Skip completely empty rows
    if (!studentName && !batchNo && !title) continue;

    // A new project group starts when batchNo AND title are non-empty
    if (batchNo && title) {
      // Save the previous project
      if (currentProject) {
        projects.push(currentProject);
      }

      const guide = clean(row[cols.guide]);
      const remark1 = clean(row[cols.remark1]);
      const remark2 = clean(row[cols.remark2]);
      const section = cols.section !== null ? clean(row[cols.section]) : '';

      const warnings: string[] = [];

      // Build the abstract
      const abstract = buildAbstract(title, remark1, remark2);
      if (abstract.length < 50) {
        warnings.push('Abstract is very short — consider adding more details after import');
      }

      // Batch name
      const batchName = section
        ? `AIML-${batchNo}-${section}`
        : `AIML-${batchNo}`;

      currentProject = {
        title: title,
        groupName: `Group ${batchNo}`,
        batchName,
        abstract,
        githubUrl: 'https://github.com/pending-upload',
        youtubeUrl: '',
        mentorName: extractMentorName(guide),
        members: [],
        tags: inferTags(title),
        warnings,
        _sheetName: sheetName,
      };

      // No github URL
      warnings.push('GitHub URL needs to be added manually');

      // Add the first member (the row that defines the project)
      if (studentName && email) {
        currentProject.members.push({
          name: studentName,
          email: email.toLowerCase().replace(/\s/g, ''),
          role: 'Team Member',
          isLead: true, // First member is assumed to be lead
        });
      }
    } else if (currentProject && studentName) {
      // This is a member row belonging to the current project group
      currentProject.members.push({
        name: studentName,
        email: email ? email.toLowerCase().replace(/\s/g, '') : `${studentName.toLowerCase().replace(/\s/g, '.')}@student.edu`,
        role: 'Team Member',
        isLead: false,
      });
    }
  }

  // Don't forget the last project
  if (currentProject) {
    projects.push(currentProject);
  }

  // Add warnings for projects with issues
  for (const proj of projects) {
    if (proj.members.length === 0) {
      proj.warnings.push('No team members found');
    }
    if (!proj.title || proj.title.length < 3) {
      proj.warnings.push('Title is missing or too short');
    }
  }

  return projects;
}

/**
 * Main entry: parse all sheets from a workbook.
 * Takes the SheetJS workbook object.
 */
export function parseWorkbook(
  workbook: any,
  sheetToJson: any
): ParsedProject[] {
  const allProjects: ParsedProject[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows = sheetToJson(sheet, { header: 1, defval: '' });
    const projects = parseSheet(rows, name);
    allProjects.push(...projects);
  }

  return allProjects;
}
