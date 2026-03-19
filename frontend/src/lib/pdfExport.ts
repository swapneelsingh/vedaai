import { GeneratedPaper } from '../types';

export async function exportToPDF(paper: GeneratedPaper): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(paper.schoolName, pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subject: ${paper.subject}`, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text(`Class: ${paper.className}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Meta line
  doc.setFontSize(10);
  doc.text(`Time Allowed: ${paper.timeAllowed}`, margin, y);
  doc.text(`Maximum Marks: ${paper.maximumMarks}`, pageWidth - margin, y, { align: 'right' });
  y += 6;

  // Divider
  doc.setDrawColor(0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // General instructions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('All questions are compulsory unless stated otherwise.', margin, y);
  y += 8;

  // Student info
  doc.setFont('helvetica', 'normal');
  doc.text('Name: ___________________________', margin, y);
  doc.text('Roll Number: __________________', margin + 100, y);
  y += 7;
  doc.text('Class: _________  Section: _________', margin, y);
  y += 10;

  // Sections
  for (const section of paper.sections) {
    checkPage(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(section.instruction, margin, y);
    y += 8;

    let qNum = 1;
    for (const q of section.questions) {
      checkPage(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const questionText = `${qNum}. ${q.text}`;
      const lines = doc.splitTextToSize(questionText, contentWidth - 30);
      doc.text(lines, margin, y);

      const metaText = `[${q.difficulty}] [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text(metaText, pageWidth - margin, y, { align: 'right' });
      doc.setTextColor(0);

      y += lines.length * 5 + 4;
      qNum++;
    }
    y += 4;
  }

  // Answer Key
  checkPage(20);
  doc.addPage();
  y = margin;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Answer Key', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  let ansNum = 1;
  for (const section of paper.sections) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    checkPage(10);
    doc.text(section.title, margin, y);
    y += 6;

    for (const q of section.questions) {
      if (!q.answer) { ansNum++; continue; }
      checkPage(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const ansText = `${ansNum}. ${q.answer}`;
      const lines = doc.splitTextToSize(ansText, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
      ansNum++;
    }
    y += 4;
  }

  doc.save(`${paper.subject}-${paper.className}-question-paper.pdf`);
}
