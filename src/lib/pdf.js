import { jsPDF } from "jspdf";

const BRAND_RED = [208, 96, 104];
const LINK_BLUE = [44, 107, 176];
const FOOTER_COPY_PARTS = {
  prefix: "©2026 - Entrepreneur Growth Alliance",
  middle: " (EGA",
  suffix: ") by VRT Management Group, LLC",
};

function formatReadableDate(dateInput) {
  const fallback = new Date();
  const rawDate = dateInput ? new Date(dateInput) : fallback;
  const safeDate = Number.isNaN(rawDate.getTime()) ? fallback : rawDate;
  return safeDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function toDataUrl(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("asset-not-found");
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function toBlobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function drawFooterContactRow(doc, width, height) {
  const y = height - 8.2;
  doc.setFontSize(9);
  const rightReservedForPageBadge = 33;
  const leftMargin = 15;
  const itemGap = 8;
  const labelValueGap = 0.7;

  const segments = [
    { label: "Phone:", value: "203 304 1918", valueColor: BRAND_RED },
    { label: "Email:", value: "coachrajesh@vrt9.com", valueColor: LINK_BLUE },
    { label: "Web:", value: "https://www.vrt9.net", valueColor: LINK_BLUE },
  ];

  const measuredSegments = segments.map((segment) => {
    doc.setFont("times", "bold");
    const labelWidth = doc.getTextWidth(segment.label);
    doc.setFont("times", "normal");
    const valueWidth = doc.getTextWidth(segment.value);
    return {
      ...segment,
      labelWidth,
      valueWidth,
      totalWidth: labelWidth + labelValueGap + valueWidth,
    };
  });

  const totalContentWidth =
    measuredSegments.reduce((sum, segment) => sum + segment.totalWidth, 0) +
    itemGap * (measuredSegments.length - 1);

  const minX = leftMargin;
  const maxX = width - rightReservedForPageBadge - totalContentWidth;
  let x = (width - totalContentWidth) / 2;
  x = Math.max(minX, Math.min(x, maxX));

  measuredSegments.forEach((segment, index) => {
    doc.setFont("times", "bold");
    doc.setTextColor(...BRAND_RED);
    doc.text(segment.label, x, y);
    x += segment.labelWidth + labelValueGap;

    doc.setFont("times", "normal");
    doc.setTextColor(...segment.valueColor);
    doc.text(segment.value, x, y);
    x += segment.valueWidth;

    if (index < measuredSegments.length - 1) {
      x += itemGap;
    }
  });
}

function drawTopHeaderFade(doc, width) {
  const barHeight = 2.2;
  const steps = 36;
  const lightTone = [235, 185, 191];

  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const r = Math.round(lightTone[0] + (BRAND_RED[0] - lightTone[0]) * t);
    const g = Math.round(lightTone[1] + (BRAND_RED[1] - lightTone[1]) * t);
    const b = Math.round(lightTone[2] + (BRAND_RED[2] - lightTone[2]) * t);
    const x = (width / steps) * i;

    doc.setFillColor(r, g, b);
    doc.rect(x, 0, width / steps + 0.2, barHeight, "F");
  }
}

function drawFooterCopyright(doc, width, height) {
  const y = height - 4.5;
  const superScriptYOffset = 1.25;
  const normalSize = 8.8;
  const superscriptSize = 6.5;

  doc.setFont("times", "bold");
  doc.setFontSize(normalSize);
  const prefixWidth = doc.getTextWidth(FOOTER_COPY_PARTS.prefix);
  const middleWidth = doc.getTextWidth(FOOTER_COPY_PARTS.middle);
  const suffixWidth = doc.getTextWidth(FOOTER_COPY_PARTS.suffix);

  doc.setFontSize(superscriptSize);
  const copyrightWidth = doc.getTextWidth("©");

  const totalWidth =
    prefixWidth + copyrightWidth + middleWidth + copyrightWidth + suffixWidth;
  let x = (width - totalWidth) / 2;

  doc.setFontSize(normalSize);
  doc.text(FOOTER_COPY_PARTS.prefix, x, y);
  x += prefixWidth;

  doc.setFontSize(superscriptSize);
  doc.text("©", x, y - superScriptYOffset);
  x += copyrightWidth;

  doc.setFontSize(normalSize);
  doc.text(FOOTER_COPY_PARTS.middle, x, y);
  x += middleWidth;

  doc.setFontSize(superscriptSize);
  doc.text("©", x, y - superScriptYOffset);
  x += copyrightWidth;

  doc.setFontSize(normalSize);
  doc.text(FOOTER_COPY_PARTS.suffix, x, y);
}

function drawHeaderAndFooter(doc, pageNumber, totalPages, logoDataUrl) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  drawTopHeaderFade(doc, width);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 18, 9, 34, 19);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_RED);
    doc.setFontSize(16);
    doc.text("VRT", 16, 20);
    doc.setFontSize(9);
    doc.text("Management Group", 16, 25);
  }

  drawFooterContactRow(doc, width, height);

  doc.setFont("times", "bold");
  doc.setTextColor(...BRAND_RED);
  drawFooterCopyright(doc, width, height);

  doc.setFillColor(...BRAND_RED);
  doc.rect(width - 31, height - 14.4, 31, 9.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.text(`${pageNumber} of ${totalPages}`, width - 15.5, height - 8.1, {
    align: "center",
  });
  doc.setTextColor(0, 0, 0);
}

function drawCoverPage(doc, reportState, growthJourneyDataUrl) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const user = reportState?.user || {};
  const coverName = user.name?.trim() || "Participant";
  const coverPosition = user.position?.trim() || "Position";
  const coverCompany = user.company?.trim() || "Company";
  const coverDate = formatReadableDate(user.reportDate);

  doc.setFont("times", "bold");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(20);
  doc.text("Personal Development Plan", width / 2, 60, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text("-Your Blueprint to Leadership and Business Growth", width / 2, 69, {
    align: "center",
  });

  doc.setDrawColor(190, 190, 190);
  doc.setFillColor(234, 239, 245);
  doc.roundedRect(52, 82, 106, 108, 2, 2, "FD");
  if (growthJourneyDataUrl) {
    doc.addImage(growthJourneyDataUrl, "PNG", 56, 86, 98, 100);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(70, 92, 120);
    doc.setFontSize(16);
    doc.text("Growth Journey", width / 2, 138, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(25, 25, 25);
  doc.setFontSize(13);
  doc.text(coverName, width / 2, height - 70, { align: "center" });
  doc.text(coverPosition, width / 2, height - 58, {
    align: "center",
  });
  doc.text(coverCompany, width / 2, height - 46, {
    align: "center",
  });
  doc.text(coverDate, width / 2, height - 36, { align: "center" });
}

function drawIntroPage(doc, reportState) {
  const { user } = reportState;
  const width = doc.internal.pageSize.getWidth();
  const name = user.name || "Participant";
  const firstName = name.split(" ")[0];
  const reportDate = formatReadableDate(user.reportDate);

  let y = 45;
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text(reportDate, 20, y);
  y += 14;
  doc.text(`Dear ${firstName},`, 20, y);

  y += 12;
  doc.setFontSize(10.5);
  const note =
    "Congratulations on taking the first step toward unlocking your leadership potential! This Personal Development Plan (PDP) is crafted to support you on your journey to personal and business excellence. Let’s make this an extraordinary chapter in your Leadership journey.";
  const noteLines = doc.splitTextToSize(note, width - 55);
  doc.text(noteLines, width / 2, y, { align: "center" });
  y += noteLines.length * 5 + 2;
  doc.text("- Rajesh Tedla", width - 30, y, { align: "right" });

  y += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Introduction:", 25, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const paragraphs = [
    "As a business leader, your growth directly shapes your business's future. In today's fast-paced world, sustainable success requires strong leadership, continuous growth and the ability to adapt with confidence.",
    "Your Personal Development Plan (PDP) is your roadmap to bridge the gap between where you are and where you aspire to be. Focused on practical, actionable strategies, it drives measurable growth for you and your business.",
    "Built on insights from your TriMetrix HD assessment and enriched by the expertise of Rajesh Tedla, a trusted expert with over 39+ years of experience helping SMBs and Entrepreneurs achieve success.",
  ];

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, width - 50);
    doc.text(lines, 25, y);
    y += lines.length * 5 + 5;
  });

  doc.setFont("helvetica", "bold");
  doc.text("What this plan requires:", 25, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text("• Clear Goals", 31, y);
  y += 5;
  doc.text("• Actionable Steps", 31, y);
  y += 5;
  doc.text("• Timeframes", 31, y);
  y += 5;
  doc.text("• Evaluation", 31, y);

  y += 10;
  const closingTop =
    "This PDP is designed for action and impact. It’s not just about self-improvement - it’s about transforming your leadership and taking your business to the next level.";
  doc.setFont("helvetica", "normal");
  const closingTopLines = doc.splitTextToSize(closingTop, width - 50);
  doc.text(closingTopLines, 25, y);
  y += closingTopLines.length * 5 + 3;

  const closingBottom =
    "Your growth drives your business’s success - Start building your future today.";
  doc.setFont("helvetica", "bold");
  const closingBottomLines = doc.splitTextToSize(closingBottom, width - 50);
  doc.text(closingBottomLines, 25, y);
}

function drawSelectionPage(doc, reportState, itemPageMap = {}) {
  const { dna25, drivingForces, behavioralTraits } = reportState;
  const sectionTitles = reportState.sectionTitles || {};
  const dna25Title = `Competencies (${sectionTitles.dna25 || "DNA"})`;
  const drivingForcesTitle = sectionTitles.drivingForces || "Driving Forces";
  const behavioralTitle = sectionTitles.behavioralTraits || "Behaviors";
  let y = 58;
  const leftX = 30;
  const rightX = doc.internal.pageSize.getWidth() - 24;

  doc.setFont("times", "bold");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(20);
  doc.text("Your Development Areas", doc.internal.pageSize.getWidth() / 2, 45, {
    align: "center",
  });

  doc.setTextColor(75, 40, 130);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${dna25Title}:`, 24, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  dna25.forEach((item, index) => {
    const label = `${index + 1}.  ${item}`;
    const targetPage = itemPageMap[item];
    if (targetPage) {
      doc.textWithLink(label, leftX, y, { pageNumber: targetPage });
      doc.text(`${targetPage}`, rightX, y, { align: "right" });
    } else {
      doc.text(label, leftX, y);
    }
    y += 6;
  });

  y += 8;
  doc.setTextColor(75, 40, 130);
  doc.setFont("helvetica", "bold");
  doc.text(`${drivingForcesTitle}:`, 24, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  drivingForces.forEach((item, index) => {
    const label = `${index + 1}.  ${item}`;
    const targetPage = itemPageMap[item];
    if (targetPage) {
      doc.textWithLink(label, leftX, y, { pageNumber: targetPage });
      doc.text(`${targetPage}`, rightX, y, { align: "right" });
    } else {
      doc.text(label, leftX, y);
    }
    y += 6;
  });

  y += 8;
  doc.setTextColor(75, 40, 130);
  doc.setFont("helvetica", "bold");
  doc.text(`${behavioralTitle}:`, 24, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  behavioralTraits.forEach((item, index) => {
    const label = `${index + 1}.  ${item}`;
    const targetPage = itemPageMap[item];
    if (targetPage) {
      doc.textWithLink(label, leftX, y, { pageNumber: targetPage });
      doc.text(`${targetPage}`, rightX, y, { align: "right" });
    } else {
      doc.text(label, leftX, y);
    }
    y += 6;
  });

}

function getItemTypeLabel(explanation, item) {
  const source = explanation?.sourceFile || "";
  if (source.includes(" - Behavior")) {
    return "Behavior";
  }
  if (source.includes(" - Driving Force")) {
    return "Driving Force";
  }
  if (source.includes(" - Competency")) {
    return "Competency";
  }
  return "Element";
}

function drawElementWorkbook(doc, item, explanation) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 24;
  const right = 24;
  const bottom = 34;
  let y = 44;

  const ensureSpace = (required) => {
    if (y + required <= pageHeight - bottom) {
      return;
    }
    doc.addPage();
    y = 44;
  };

  const drawTextBlock = (text, width, lineHeight = 5, x = left) => {
    const lines = doc.splitTextToSize(text, width);
    ensureSpace(lines.length * lineHeight + 2);
    doc.text(lines, x, y);
    y += lines.length * lineHeight + 2;
  };

  const drawNumberedList = (items) => {
    items.forEach((item, idx) => {
      const prefix = `${idx + 1}. `;
      const contentWidth = pageWidth - left - right - 9;
      const lines = doc.splitTextToSize(item, contentWidth);
      ensureSpace(lines.length * 5.2 + 2);
      doc.setFont("helvetica", "normal");
      doc.text(prefix, left, y);
      doc.text(lines, left + 7, y);
      y += lines.length * 5.2 + 2;
    });
  };

  const drawNumberedListWithBoldPrefix = (items) => {
    items.forEach((entry, idx) => {
      const prefix = `${idx + 1}. `;
      const contentWidth = pageWidth - left - right - 9;
      const colonIndex = entry.indexOf(":");

      if (colonIndex <= 0) {
        const lines = doc.splitTextToSize(entry, contentWidth);
        ensureSpace(lines.length * 5.2 + 2);
        doc.setFont("helvetica", "normal");
        doc.text(prefix, left, y);
        doc.text(lines, left + 7, y);
        y += lines.length * 5.2 + 2;
        return;
      }

      const boldPart = entry.slice(0, colonIndex + 1);
      const restPart = entry.slice(colonIndex + 1).trim();

      ensureSpace(8);
      doc.setFont("helvetica", "normal");
      doc.text(prefix, left, y);

      doc.setFont("helvetica", "bold");
      doc.text(boldPart, left + 7, y);
      const boldWidth = doc.getTextWidth(boldPart);

      doc.setFont("helvetica", "normal");
      const firstLineWidth = contentWidth - boldWidth - 1.5;
      const restLines = doc.splitTextToSize(restPart, firstLineWidth > 25 ? firstLineWidth : contentWidth);

      if (restLines.length > 0) {
        doc.text(restLines[0], left + 7 + boldWidth + 1.5, y);
      }
      y += 5.2;

      if (restLines.length > 1) {
        const remaining = restLines.slice(1);
        ensureSpace(remaining.length * 5.2 + 2);
        doc.text(remaining, left + 7, y);
        y += remaining.length * 5.2;
      }

      y += 2;
    });
  };

  const safeExplanation = {
    definition: "",
    instruction: "",
    effortLevels: [],
    behavioralIndicators: [],
    developmentStrategies: [],
    reflectionQuestions: [],
    ...(explanation || {}),
  };
  const itemType = getItemTypeLabel(safeExplanation, item);

  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_RED);
  drawTextBlock(
    `${item} ${itemType}`,
    pageWidth - left - right
  );
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.8);
  drawTextBlock(safeExplanation.definition, pageWidth - left - right, 5.3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  drawTextBlock("Instruction / Action Statement", pageWidth - left - right, 5.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.8);
  if (safeExplanation.instruction) {
    drawTextBlock(safeExplanation.instruction, pageWidth - left - right, 5.2);
  } else {
    drawTextBlock(
      `Review the definition of ${item} ${itemType} and reflect on its relevance to your role and goals. Select one effort level that best reflects development priority, then define activities to close the gap.`,
      pageWidth - left - right,
      5.2
    );
  }

  const colors = [
    [236, 124, 44],
    [32, 93, 196],
    [92, 171, 74],
    [242, 194, 0],
  ];
  const labels = ["Critical", "Important", "Future Priority", "Personal Growth"];
  let legendX = left;
  colors.forEach((rgb, idx) => {
    doc.setFillColor(...rgb);
    doc.rect(legendX, y, 8, 8, "F");
    doc.setDrawColor(190, 190, 190);
    doc.rect(legendX, y, 8, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(labels[idx], legendX + 10, y + 5.6);
    legendX += idx === 2 ? 37 : 31;
  });
  y += 13;

  safeExplanation.effortLevels.forEach((entry, idx) => {
    ensureSpace(13);
    doc.setFillColor(...colors[idx]);
    doc.rect(left, y - 0.7, 8, 8, "F");
    doc.setDrawColor(190, 190, 190);
    doc.rect(left, y - 0.7, 8, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(entry.level, left + 11, y + 4.8);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.8);
    drawTextBlock(entry.detail, pageWidth - left - right - 11, 5.2, left + 11);
    y += 1.5;
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 0, 0);
  doc.setFontSize(14);
  ensureSpace(14);
  doc.text(item, left, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  drawTextBlock(
    safeExplanation.behavioralIndicators[0] || "",
    pageWidth - left - right
  );

  ensureSpace(20);
  drawNumberedList(safeExplanation.behavioralIndicators.slice(1));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  ensureSpace(12);
  const strategyLeadText = `Unlock your potential in this area by exploring and applying these empowering strategies, each step brings you closer to mastering this ${itemType} and achieving your goals!`;
  drawTextBlock(strategyLeadText, pageWidth - left - right, 5.3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.8);
  drawNumberedListWithBoldPrefix(safeExplanation.developmentStrategies);

  ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Commitment to Growth and Action Plan", pageWidth / 2, y, {
    align: "center",
  });
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const itemTypeLabelForPrompt =
    itemType === "Driving Force"
      ? "Driving force"
      : itemType === "Behavior"
        ? "Behavior"
        : itemType === "Competency" || itemType === "Element"
          ? "Competency"
          : itemType;
  const actionPrompts = [
    `What did you accomplish or learn from the activity? How did it help you improve your ability in this ${itemTypeLabelForPrompt}?`,
    "What challenges did you face, what strategies worked well, and what will you do differently next time?",
  ];
  actionPrompts.forEach((prompt) => {
    const boxX = left;
    const boxSize = 3.2;
    const textX = boxX + boxSize + 4;
    const textWidth = pageWidth - textX - right;
    const lines = doc.splitTextToSize(prompt, textWidth);
    ensureSpace(lines.length * 5.2 + 4);
    doc.setDrawColor(0, 0, 0);
    doc.rect(boxX, y - 2.7, boxSize, boxSize);
    doc.text(lines, textX, y);
    y += lines.length * 5.2 + 3.5;
  });

  const tableX = 18;
  const tableWidth = pageWidth - 36;
  const colWidths = [68, 19, 19, tableWidth - 106];
  const rowHeight = 8.5;
  const rows = 10;
  let drawnRows = 0;
  let pageIndex = 0;

  while (drawnRows < rows) {
    ensureSpace(70);
    const rowsThisPage = pageIndex === 0 ? 10 : rows - drawnRows;
    const top = y;
    const headerHeight = pageIndex === 0 ? 12 : 0;
    const bodyHeight = rowsThisPage * rowHeight;
    const fullHeight = headerHeight + bodyHeight;

    doc.setDrawColor(0, 0, 0);
    doc.rect(tableX, top, tableWidth, fullHeight);
    let vx = tableX + colWidths[0];
    doc.line(vx, top, vx, top + fullHeight);
    vx += colWidths[1];
    doc.line(vx, top, vx, top + fullHeight);
    vx += colWidths[2];
    doc.line(vx, top, vx, top + fullHeight);

    if (pageIndex === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Development Activities", tableX + colWidths[0] / 2, top + 7.5, {
        align: "center",
      });
      doc.text("Start\nDate", tableX + colWidths[0] + colWidths[1] / 2, top + 6, {
        align: "center",
      });
      doc.text(
        "End\nDate",
        tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
        top + 6,
        { align: "center" }
      );
      doc.text("Results/Notes/Observation", tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, top + 7.5, {
        align: "center",
      });
    }

    for (let i = 0; i < rowsThisPage; i += 1) {
      const rowTop = top + headerHeight + i * rowHeight;
      doc.line(tableX, rowTop, tableX + tableWidth, rowTop);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${drawnRows + i + 1}.`, tableX + 3, rowTop + 8);
    }

    y = top + fullHeight + 6;
    drawnRows += rowsThisPage;
    pageIndex += 1;
  }

  ensureSpace(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text("Evaluation/Measurables/ Reflection", left, y);
  y += 10;
  drawTextBlock(
    "Note: Make sure to finish all 10 exercises before answering the below questions, so the learning process stays clear and effective.",
    pageWidth - left - right
  );

  const questions = safeExplanation.reflectionQuestions;
  questions.forEach((question, index) => {
    const boxHeight = index === questions.length - 1 ? 28 : 14;
    ensureSpace(boxHeight + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    drawTextBlock(`${index + 1}. ${question}`, pageWidth - left - right, 5.2);
    ensureSpace(boxHeight + 4);
    doc.setDrawColor(120, 120, 120);
    y += 1;
    doc.rect(left + 5, y, pageWidth - left - right - 7, boxHeight);
    y += boxHeight + 5;
  });

  ensureSpace(30);
  doc.setDrawColor(0, 0, 0);
  y += 6;
  doc.line(left, y, left + 55, y);
  doc.line(pageWidth - right - 30, y, pageWidth - right, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("PDP Leader Signature", left, y);
  doc.text("Date", pageWidth - right - 25, y);

  ensureSpace(30);
  y += 10;
  doc.line(left, y, left + 55, y);
  doc.line(pageWidth - right - 30, y, pageWidth - right, y);
  y += 6;
  doc.text("Accountability partner signature", left, y);
  doc.text("Date", pageWidth - right - 25, y);
}

function drawItemExplanationsPages(doc, reportState) {
  const all = [
    ...reportState.dna25,
    ...reportState.drivingForces,
    ...reportState.behavioralTraits,
  ];
  if (!all.length) {
    return {};
  }

  const pageMap = {};
  all.forEach((item) => {
    pageMap[item] = doc.getNumberOfPages() + 1;
    const overrideExplanation = reportState.itemExplanationOverrides?.[item] || null;
    const effectiveExplanation = {
      ...(reportState.itemExplanations?.[item] || {}),
      ...(overrideExplanation || {}),
      definition:
        overrideExplanation?.definition?.trim() ||
        reportState.itemDescriptions?.[item] ||
        "",
    };

    drawElementWorkbook(
      doc,
      item,
      effectiveExplanation
    );
  });
  return pageMap;
}

export async function generateReportPdf(reportState) {
  const doc = new jsPDF("p", "mm", "a4");
  let logoDataUrl = null;
  let growthJourneyDataUrl = null;
  const logoCandidates = [
    "/vrt-logo.png",
    "/vrt/logo.png",
    "/vrt/vrt-logo.png",
    "/vrt.png",
  ];

  for (const logoPath of logoCandidates) {
    try {
      logoDataUrl = await toDataUrl(logoPath);
      break;
    } catch {
      logoDataUrl = null;
    }
  }

  const growthJourneyCandidates = [
    "/image.png",
  ];
  for (const imagePath of growthJourneyCandidates) {
    try {
      growthJourneyDataUrl = await toDataUrl(imagePath);
      break;
    } catch {
      growthJourneyDataUrl = null;
    }
  }

  drawCoverPage(doc, reportState, growthJourneyDataUrl);
  doc.addPage();
  drawIntroPage(doc, reportState);
  doc.addPage();
  const selectionPageNumber = doc.getNumberOfPages();
  const itemPageMap = drawItemExplanationsPages(doc, reportState);
  doc.setPage(selectionPageNumber);
  drawSelectionPage(doc, reportState, itemPageMap);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    drawHeaderAndFooter(doc, i, totalPages, logoDataUrl);
  }

  const fileName = `${(reportState.user.name || "respondent").replaceAll(
    " ",
    "_"
  )}_PDP_Report.pdf`;
  const pdfBlob = doc.output("blob");
  const pdfDataUrl = await toBlobDataUrl(pdfBlob);
  doc.save(fileName);
  return { fileName, pdfDataUrl };
}
