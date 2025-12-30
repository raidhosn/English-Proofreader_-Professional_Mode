
import React, { useState, useRef, useMemo } from 'react';

interface ComparisonTableProps {
  original: string;
  proofread: string;
}

/**
 * Simple token-based diff utility to compute word-level changes.
 */
function computeDiff(str1: string, str2: string) {
  const tokens1 = str1.split(/(\s+|[.,!?;:()])/);
  const tokens2 = str2.split(/(\s+|[.,!?;:()])/);

  const n = tokens1.length;
  const m = tokens2.length;
  const matrix: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokens1[i - 1] === tokens2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  let i = n, j = m;
  const diff1: { token: string; type: 'unchanged' | 'removed' }[] = [];
  const diff2: { token: string; type: 'unchanged' | 'added' }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      diff1.unshift({ token: tokens1[i - 1], type: 'unchanged' });
      diff2.unshift({ token: tokens2[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      diff2.unshift({ token: tokens2[j - 1], type: 'added' });
      j--;
    } else {
      diff1.unshift({ token: tokens1[i - 1], type: 'removed' });
      i--;
    }
  }

  return { diff1, diff2 };
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ original, proofread }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  const proofreadAreaRef = useRef<HTMLDivElement>(null);

  /**
   * Sanitizes the content by removing any plain-text table data or repeated headers.
   */
  const getCleanedText = (text: string) => {
    const tableHeaderStart = ["Subscription ID", "SUBSCRIPTION ID", "REQUEST TYPE", "|", "---"];
    let content = text;
    
    let earliestIndex = -1;
    for (const marker of tableHeaderStart) {
      const idx = content.indexOf(marker);
      if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
        earliestIndex = idx;
      }
    }

    if (earliestIndex !== -1) {
      content = content.substring(0, earliestIndex);
    }

    // Strip greetings and closing placeholders as they are part of the template
    return content
      .replace(/Hello,?/gi, '')
      .replace(/To verify and confirm.*/gis, '') 
      .replace(/Please confirm.*/gis, '')
      .trim();
  };

  /**
   * Computes the diff between original and proofread text blocks.
   */
  const { diffOriginal, diffProofread } = useMemo(() => {
    const cleanOrig = getCleanedText(original);
    const cleanProof = getCleanedText(proofread);
    const { diff1, diff2 } = computeDiff(cleanOrig, cleanProof);
    return { diffOriginal: diff1, diffProofread: diff2 };
  }, [original, proofread]);

  /**
   * Formats the diff array into HTML with highlights.
   */
  const formatDiffHtml = (diff: { token: string; type: string }[], color: string) => {
    return diff.map(item => {
      if (item.type === 'removed' || item.type === 'added') {
        return `<span style="background-color: ${color}; border-radius: 2px;">${item.token}</span>`;
      }
      return item.token;
    }).join('').split('\n').filter(line => line.trim() !== '').join('<br><br>');
  };

  /**
   * Generates the subscription table rows with Word-compatible styles.
   */
  const renderTableRows = (isOriginal: boolean) => {
    const data = [
      { id: '689ebfb2-0f24-4c89-85dd-9f40f58c22a9', type: 'Region Enablement', vm: 'ESv3 Series', region: 'Brazil South', cores: '350' },
      { id: '689ebfb2-0f24-4c89-85dd-9f40f58c22a9', type: 'Region Enablement', vm: 'Ev3 Series', region: 'Brazil South', cores: '350' },
      { id: '689ebfb2-0f24-4c89-85dd-9f40f58c22a9', type: 'Region Enablement', vm: 'Dsv6 Series', region: 'Brazil South', cores: '350' }
    ];

    return data.map(row => `
      <tr>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px; word-break: break-all;">${row.id}</td>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px;">${row.type}</td>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px;">${row.vm}</td>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px;">${row.region}</td>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px;">${row.cores}</td>
        <td style="border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 6px 8px;">${isOriginal ? 'Pending' : 'Fulfilled'}</td>
      </tr>
    `).join('');
  };

  /**
   * Renders a single column content.
   */
  const renderColumnContent = (isOriginal: boolean, forWord: boolean = false) => {
    const textColor = isOriginal ? '#666666' : '#111111';
    const highlightColor = isOriginal ? '#FFFF00' : '#98FB98'; // Updated to #FFFF00 for Original Text
    const diffHtml = isOriginal 
      ? formatDiffHtml(diffOriginal, '#FFFF00') // Updated to #FFFF00 for Original Text
      : formatDiffHtml(diffProofread, '#98FB98');
    
    const blankLineHtml = forWord ? '<p style="margin: 0; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">&nbsp;</p>' : '';
    
    const tableStyles = forWord 
      ? 'border-collapse: collapse; width: auto; margin: 0 auto; border: 1px solid #000000; font-family: Calibri, Arial, sans-serif; font-size: 11pt;'
      : 'border-collapse: collapse; width: 100%; border: 1px solid #000000; font-family: Calibri, Arial, sans-serif; font-size: 10pt; margin: 15pt 0;';

    const cellPadding = forWord ? '6px 8px' : '10px';

    return `
      <div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #333333; line-height: 1.5; text-align: left;">
        <p style="margin: 0 0 12pt 0; color: ${isOriginal ? '#999' : '#333'};">Hello,</p>
        
        <div style="padding: 4pt 0; margin-bottom: 20pt; color: ${textColor};">
          ${diffHtml}
        </div>

        ${blankLineHtml}
        <table border="1" cellspacing="0" cellpadding="0" style="${tableStyles}">
          <thead>
            <tr style="background-color: #D3D3D3;">
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">SUBSCRIPTION ID</th>
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">REQUEST TYPE</th>
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">VM TYPE</th>
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">REGION</th>
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">CORES</th>
              <th style="border: 1px solid #000000; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; color: #000000; padding: ${cellPadding};">STATUS</th>
            </tr>
          </thead>
          <tbody style="background-color: #ffffff; color: #333333;">
            ${renderTableRows(isOriginal)}
          </tbody>
        </table>
        ${blankLineHtml}

        <p style="margin: 0 0 10pt 0; color: ${isOriginal ? '#999' : '#333'};">To verify and confirm a quota increase in Azure:</p>
        <ol style="margin: 0 0 20pt 25pt; padding: 0; color: ${isOriginal ? '#999' : '#333'};">
          <li style="margin-bottom: 5pt;">Go to <a href="https://portal.azure.com" style="color: #0078d4; text-decoration: underline;">Azure Portal</a> and sign in.</li>
          <li style="margin-bottom: 5pt;">Navigate to <b>"Usage + quotas"</b> in the search bar.</li>
          <li style="margin-bottom: 5pt;">Select your <b>subscription and region</b> where the request was made.</li>
          <li style="margin-bottom: 5pt;">Filter by <b>"Show All"</b> to view the updated quota.</li>
          <li style="margin-bottom: 5pt;">Check if the new limits match your request.</li>
        </ol>

        <p style="margin: 0; color: ${isOriginal ? '#999' : '#333'};">Please confirm if the increase was successful and let us know if you need further assistance.</p>
      </div>
    `;
  };

  /**
   * Generates a Word-ready HTML fragment representing ONLY the PROOFREAD result.
   */
  const generateProofreadOnlyWordHtml = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="background-color: #ffffff; margin: 0; padding: 20pt;">
  ${renderColumnContent(false, true)}
</body>
</html>
    `.trim();
  };

  const handleCopy = async () => {
    const htmlContent = generateProofreadOnlyWordHtml();
    
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const data = [new ClipboardItem({ 
        'text/html': blob,
        'text/plain': new Blob([proofread], { type: 'text/plain' }) 
      })];
      
      await navigator.clipboard.write(data);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-[#004d57]/50 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#a5f3fc] rounded-2xl flex items-center justify-center text-[#004d57] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
            <i className="fa-solid fa-file-invoice text-2xl"></i>
          </div>
          <div>
            <h4 className="text-white font-black text-lg uppercase tracking-widest">Enterprise Quota Release</h4>
            <p className="text-[#a5f3fc]/70 text-sm font-medium">Smart-Diff highlighting enabled</p>
          </div>
        </div>
        <button 
          onClick={handleCopy}
          className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl active:scale-95 ${
            copyStatus === 'success' 
              ? 'bg-green-500 text-white scale-105' 
              : 'bg-[#a5f3fc] text-[#004d57] hover:bg-white hover:shadow-[#a5f3fc]/20'
          }`}
        >
          {copyStatus === 'success' ? (
            <><i className="fa-solid fa-check-double mr-3"></i> Copied!</>
          ) : (
            <><i className="fa-solid fa-file-word mr-3"></i> Copy HTML to Word Document</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-gray-200 p-10 md:p-16">
        {/* Original Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Original Text (Deletions)</span>
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          </div>
          <div 
            className="bg-[#FAFAFA] rounded-3xl p-10 border border-gray-100 min-h-[500px] shadow-sm overflow-auto"
            dangerouslySetInnerHTML={{ __html: renderColumnContent(true) }}
          />
        </div>

        {/* Proofread Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[#004d57] text-[10px] font-black uppercase tracking-[0.4em]">Proofread Text (Additions)</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div 
            ref={proofreadAreaRef}
            className="bg-white rounded-3xl p-10 border-2 border-[#a5f3fc]/20 min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-auto text-black"
            dangerouslySetInnerHTML={{ __html: renderColumnContent(false) }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        ol { list-style-type: decimal !important; }
        b, strong { font-weight: 800 !important; }
        td, th { word-wrap: break-word !important; }
        span { display: inline; }
      `}} />
    </div>
  );
};

export default ComparisonTable;
