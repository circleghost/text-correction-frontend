import { diff_match_patch, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch';

export interface DiffResult {
  type: 'equal' | 'insert' | 'delete';
  text: string;
  index: number;
}

export interface ProcessedDiff {
  original: DiffResult[];
  corrected: DiffResult[];
  hasChanges: boolean;
  changeCount: number;
}

/**
 * Create diff results using diff-match-patch algorithm
 */
export function createTextDiff(originalText: string, correctedText: string): ProcessedDiff {
  const dmp = new diff_match_patch();
  
  // Configure diff algorithm for better Chinese text handling
  dmp.Diff_Timeout = 1.0;
  dmp.Diff_EditCost = 4;
  
  const diffs = dmp.diff_main(originalText, correctedText);
  dmp.diff_cleanupSemantic(diffs);
  
  const originalResults: DiffResult[] = [];
  const correctedResults: DiffResult[] = [];
  
  let originalIndex = 0;
  let correctedIndex = 0;
  let changeCount = 0;
  
  for (const [operation, text] of diffs) {
    switch (operation) {
      case DIFF_EQUAL:
        originalResults.push({
          type: 'equal',
          text,
          index: originalIndex
        });
        correctedResults.push({
          type: 'equal',
          text,
          index: correctedIndex
        });
        originalIndex += text.length;
        correctedIndex += text.length;
        break;
        
      case DIFF_DELETE:
        originalResults.push({
          type: 'delete',
          text,
          index: originalIndex
        });
        originalIndex += text.length;
        changeCount++;
        break;
        
      case DIFF_INSERT:
        correctedResults.push({
          type: 'insert',
          text,
          index: correctedIndex
        });
        correctedIndex += text.length;
        changeCount++;
        break;
    }
  }
  
  return {
    original: originalResults,
    corrected: correctedResults,
    hasChanges: changeCount > 0,
    changeCount
  };
}

/**
 * Get character-level diff for fine-grained comparison
 */
export function getCharacterDiff(originalText: string, correctedText: string): ProcessedDiff {
  return createTextDiff(originalText, correctedText);
}

/**
 * Get word-level diff for broader comparison
 */
export function getWordDiff(originalText: string, correctedText: string): ProcessedDiff {
  const dmp = new diff_match_patch();
  
  // Split into words for word-level comparison
  const originalWords = originalText.split(/(\s+)/);
  const correctedWords = correctedText.split(/(\s+)/);
  
  const originalWordText = originalWords.join('\n');
  const correctedWordText = correctedWords.join('\n');
  
  const diffs = dmp.diff_main(originalWordText, correctedWordText);
  dmp.diff_cleanupSemantic(diffs);
  
  const originalResults: DiffResult[] = [];
  const correctedResults: DiffResult[] = [];
  
  let originalIndex = 0;
  let correctedIndex = 0;
  let changeCount = 0;
  
  for (const [operation, text] of diffs) {
    const displayText = text.replace(/\n/g, '');
    
    switch (operation) {
      case DIFF_EQUAL:
        if (displayText) {
          originalResults.push({
            type: 'equal',
            text: displayText,
            index: originalIndex
          });
          correctedResults.push({
            type: 'equal',
            text: displayText,
            index: correctedIndex
          });
        }
        originalIndex += displayText.length;
        correctedIndex += displayText.length;
        break;
        
      case DIFF_DELETE:
        if (displayText) {
          originalResults.push({
            type: 'delete',
            text: displayText,
            index: originalIndex
          });
          originalIndex += displayText.length;
          changeCount++;
        }
        break;
        
      case DIFF_INSERT:
        if (displayText) {
          correctedResults.push({
            type: 'insert',
            text: displayText,
            index: correctedIndex
          });
          correctedIndex += displayText.length;
          changeCount++;
        }
        break;
    }
  }
  
  return {
    original: originalResults,
    corrected: correctedResults,
    hasChanges: changeCount > 0,
    changeCount
  };
}

/**
 * Create inline diff for mobile view
 */
export function createInlineDiff(originalText: string, correctedText: string): DiffResult[] {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(originalText, correctedText);
  dmp.diff_cleanupSemantic(diffs);
  
  const results: DiffResult[] = [];
  let index = 0;
  
  for (const [operation, text] of diffs) {
    let type: 'equal' | 'insert' | 'delete' = 'equal';
    
    switch (operation) {
      case DIFF_DELETE:
        type = 'delete';
        break;
      case DIFF_INSERT:
        type = 'insert';
        break;
      case DIFF_EQUAL:
        type = 'equal';
        break;
    }
    
    results.push({
      type,
      text,
      index
    });
    
    index += text.length;
  }
  
  return results;
}

/**
 * Calculate diff statistics
 */
export function getDiffStats(diff: ProcessedDiff): {
  insertions: number;
  deletions: number;
  changes: number;
  accuracy: number;
} {
  const insertions = diff.corrected.filter(d => d.type === 'insert').length;
  const deletions = diff.original.filter(d => d.type === 'delete').length;
  const changes = insertions + deletions;
  
  const totalOriginal = diff.original.reduce((sum, d) => sum + d.text.length, 0);
  const accuracy = totalOriginal > 0 ? Math.max(0, ((totalOriginal - changes) / totalOriginal) * 100) : 100;
  
  return {
    insertions,
    deletions,
    changes,
    accuracy: Math.round(accuracy * 100) / 100
  };
}