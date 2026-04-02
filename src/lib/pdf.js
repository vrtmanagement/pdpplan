import { jsPDF } from "jspdf";

const BRAND_RED = [208, 96, 104];
const LINK_BLUE = [120, 173, 232];
const RED_600 = [220, 38, 38];
const PURPLE_600 = [147, 51, 234];
const COMPETENCY_PURPLE = [75, 40, 130];
const FOOTER_CONTACT =
  "Phone: 203 304 1918   Email: coachrajesh@vrt9.com   Web: https://www.vrt9.net";
const FOOTER_COPYRIGHT =
  "©2026 - Entrepreneur Growth Alliance© (EGA©) by VRT Management Group, LLC";
const MIDDLE_PAGE_TOP_OFFSET = 12;

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

function drawMiddlePageFooter(doc, pageNumber, totalPages) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const footerLeft = 30;
  const footerTopY = height - 8.4;

  // Keep footer content slightly lower and page number shifted left
  // to align with the bottom-right red area in middle background image.
  doc.setFont("times", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...BRAND_RED);
  doc.text("Phone: 203 304 1918   Email: ", footerLeft, footerTopY);
  const phonePrefixWidth = doc.getTextWidth("Phone: 203 304 1918   Email: ");
  doc.setTextColor(...LINK_BLUE);
  doc.text("coachrajesh@vrt9.com", footerLeft + phonePrefixWidth, footerTopY);
  const emailWidth = doc.getTextWidth("coachrajesh@vrt9.com");
  doc.setTextColor(...BRAND_RED);
  doc.text("   Web: ", footerLeft + phonePrefixWidth + emailWidth, footerTopY);
  const webPrefixWidth = doc.getTextWidth("Phone: 203 304 1918   Email: coachrajesh@vrt9.com   Web: ");
  doc.setTextColor(...LINK_BLUE);
  doc.text("https://www.vrt9.net", footerLeft + webPrefixWidth, footerTopY);

  doc.setTextColor(...BRAND_RED);
  doc.text(FOOTER_COPYRIGHT, footerLeft, height - 4.9);

  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${pageNumber} of ${totalPages}`, width - 19.2, height - 2.2, {
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
  doc.text("-Your Roadmap to Leadership and Business Growth", width / 2, 69, {
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
  doc.setTextColor(75, 40, 130);
  doc.setFontSize(11.5);
  doc.text("Customized for", width / 2, height - 76, { align: "center" });


  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(coverName, width / 2, height - 64, { align: "center" });
  doc.text(coverPosition, width / 2, height - 56, {
    align: "center",
  });
  doc.text(coverCompany, width / 2, height - 49, {
    align: "center",
  });
  doc.text(coverDate, width / 2, height - 42, { align: "center" });
}

function drawPageBackground(doc, imageDataUrl) {
  if (!imageDataUrl) return;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.addImage(imageDataUrl, "PNG", 0, 0, width, height);
}

function sanitizeFieldNamePart(value) {
  return String(value || "field")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "field";
}

function addEditableTextField(doc, config) {
  const {
    name,
    x,
    y,
    width,
    height,
    multiline = false,
    fontSize = 10,
    textAlign = "left",
  } = config;
  try {
    const field = new doc.AcroForm.TextField();
    field.fieldName = name;
    field.x = x;
    field.y = y;
    field.width = width;
    field.height = height;
    field.fontSize = fontSize;
    field.multiline = multiline;
    field.doNotScroll = false;
    field.doNotSpellCheck = false;
    field.textAlign = textAlign;
    field.defaultValue = "";
    field.value = "";
    field.required = false;
    doc.addField(field);
    return true;
  } catch {
    return false;
  }
}

function drawIntroPage(doc, reportState) {
  const { user } = reportState;
  const width = doc.internal.pageSize.getWidth();
  const name = user.name || "Participant";
  const firstName = name.split(" ")[0];
  const reportDate = formatReadableDate(user.reportDate);

  let y = 45 + MIDDLE_PAGE_TOP_OFFSET;
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text(reportDate, 20, y);
  y += 14;
  doc.text(`Dear ${firstName},`, 20, y);

  y += 12;
  doc.setFontSize(10.5);
  const note =
    "Congratulations on taking the first step toward unlocking your leadership potential! This Personal Development Plan (PDP) is customized to support you on your journey to personal and business growth. Let’s make this an extraordinary chapter in your Leadership journey.";
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
    "As a professional, your growth directly shapes your business's future. In today's fast-paced world, sustainable success requires strong leadership, continuous growth and the ability to adapt with confidence.",
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
  let y = 58 + MIDDLE_PAGE_TOP_OFFSET;
  const leftX = 30;
  const rightX = doc.internal.pageSize.getWidth() - 24;

  doc.setFont("times", "bold");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(20);
  doc.text("Your Development Areas", doc.internal.pageSize.getWidth() / 2, 45 + MIDDLE_PAGE_TOP_OFFSET, {
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

function drawElementWorkbook(doc, item, explanation, middlePageDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 24;
  const right = 24;
  const bottom = 24;
  let y = 44 + MIDDLE_PAGE_TOP_OFFSET;
  const fieldPrefix = sanitizeFieldNamePart(item);
  let fieldCount = 1;

  const ensureSpace = (required) => {
    if (y + required <= pageHeight - bottom) {
      return;
    }
    doc.addPage();
    drawPageBackground(doc, middlePageDataUrl);
    y = 44 + MIDDLE_PAGE_TOP_OFFSET;
  };

  const nextFieldName = (suffix) =>
    `${fieldPrefix}_${suffix}_${doc.getCurrentPageInfo().pageNumber}_${fieldCount++}`;

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
      const prefix = `${idx + 1}.`;
      const contentX = left + 6;
      const contentWidth = pageWidth - contentX - right;
      const colonIndex = entry.indexOf(":");

      if (colonIndex <= 0) {
        const lines = doc.splitTextToSize(entry, contentWidth);
        ensureSpace(lines.length * 5.2 + 2);
        doc.setFont("helvetica", "normal");
        doc.text(prefix, left, y);
        doc.text(lines, contentX, y);
        y += lines.length * 5.2 + 2;
        return;
      }

      const boldPart = entry.slice(0, colonIndex + 1);
      const restPart = entry.slice(colonIndex + 1).trim();
      const restLines = restPart
        ? doc.splitTextToSize(restPart, contentWidth)
        : [];
      const entryHeight = 5.2 + restLines.length * 5.2 + 2;

      ensureSpace(entryHeight);
      doc.setFont("helvetica", "normal");
      doc.text(prefix, left, y);

      doc.setFont("helvetica", "bold");
      doc.text(boldPart, contentX, y);
      y += 5.2;

      doc.setFont("helvetica", "normal");
      if (restLines.length) {
        doc.text(restLines, contentX, y);
        y += restLines.length * 5.2;
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
  drawPageBackground(doc, middlePageDataUrl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...RED_600);
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
  y += 18;

  safeExplanation.effortLevels.forEach((entry, idx) => {
    ensureSpace(13);
    doc.setFillColor(...colors[idx]);
    doc.rect(left, y, 8, 8, "F");
    doc.setDrawColor(190, 190, 190);
    doc.rect(left, y, 8, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(entry.level, left + 11, y + 5.9);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.8);
    drawTextBlock(entry.detail, pageWidth - left - right - 11, 5.2, left + 11);
    y += 1.5;
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...RED_600);
  doc.setFontSize(14);
  // Keep red section title from appearing at very bottom alone.
  ensureSpace(28);
  doc.text(item, left, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
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
  y += 2;
  doc.setTextColor(...COMPETENCY_PURPLE);
  const strategyLeadText = `Unlock your potential in this area by exploring and applying these empowering strategies, each step brings you closer to mastering this ${itemType} and achieving your goals!`;
  drawTextBlock(strategyLeadText, pageWidth - left - right, 5.3);
  doc.setTextColor(0, 0, 0);
  y += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.8);
  drawNumberedListWithBoldPrefix(safeExplanation.developmentStrategies);

  ensureSpace(20);
  y += 4;
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
    const headerHeight = pageIndex === 0 ? 12 : 0;
    ensureSpace(headerHeight + rowHeight + 6);
    const top = y;
    const availableHeight = pageHeight - bottom - top;
    const maxRowsThisPage = Math.floor((availableHeight - headerHeight) / rowHeight);
    const rowsThisPage = Math.min(
      rows - drawnRows,
      Math.max(1, maxRowsThisPage)
    );
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
      doc.text(`${drawnRows + i + 1}.`, tableX + 3, rowTop + rowHeight / 2 + 1.3);

      const activityX = tableX + 8;
      const activityY = rowTop + 1.1;
      const activityWidth = colWidths[0] - 9.6;
      const dateY = rowTop + 1.1;
      const dateHeight = rowHeight - 2.2;
      const notesX = tableX + colWidths[0] + colWidths[1] + colWidths[2] + 1.2;
      const notesWidth = colWidths[3] - 2.4;
      addEditableTextField(doc, {
        name: nextFieldName("activity"),
        x: activityX,
        y: activityY,
        width: activityWidth,
        height: dateHeight,
        multiline: true,
        fontSize: 9,
      });
      addEditableTextField(doc, {
        name: nextFieldName("start_date"),
        x: tableX + colWidths[0] + 1.2,
        y: dateY,
        width: colWidths[1] - 2.4,
        height: dateHeight,
        multiline: false,
        fontSize: 9,
      });
      addEditableTextField(doc, {
        name: nextFieldName("end_date"),
        x: tableX + colWidths[0] + colWidths[1] + 1.2,
        y: dateY,
        width: colWidths[2] - 2.4,
        height: dateHeight,
        multiline: false,
        fontSize: 9,
      });
      addEditableTextField(doc, {
        name: nextFieldName("result_notes"),
        x: notesX,
        y: dateY,
        width: notesWidth,
        height: dateHeight,
        multiline: true,
        fontSize: 9,
      });
    }

    y = top + fullHeight + 6;
    drawnRows += rowsThisPage;
    pageIndex += 1;
  }

  ensureSpace(50);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text("Evaluation/Measurables/ Reflection", 18, y);
  y += 10;
  drawTextBlock(
    "Note: Make sure to finish all 10 exercises before answering the below questions, so the learning process stays clear and effective.",
    pageWidth - 36,
    5,
    18
  );

  const questions = safeExplanation.reflectionQuestions;
  questions.forEach((question, index) => {
    const boxHeight = index === questions.length - 1 ? 28 : 14;
    ensureSpace(boxHeight + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const qLines = doc.splitTextToSize(`${index + 1}. ${question}`, pageWidth - 36);
    ensureSpace(qLines.length * 5.2 + boxHeight + 10);
    doc.text(qLines, 18, y);
    y += qLines.length * 5.2;
    ensureSpace(boxHeight + 10);
    doc.setDrawColor(120, 120, 120);
    doc.rect(18, y, pageWidth - 36, boxHeight);
    addEditableTextField(doc, {
      name: nextFieldName(`reflection_${index + 1}`),
      x: 19.2,
      y: y + 1.2,
      width: pageWidth - 38.4,
      height: boxHeight - 2.4,
      multiline: true,
      fontSize: 10,
    });
    y += boxHeight + 10;
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
  addEditableTextField(doc, {
    name: nextFieldName("leader_signature"),
    x: left,
    y: y - 10.5,
    width: 55,
    height: 6.8,
    multiline: false,
    fontSize: 10,
  });
  addEditableTextField(doc, {
    name: nextFieldName("leader_date"),
    x: pageWidth - right - 30,
    y: y - 10.5,
    width: 30,
    height: 6.8,
    multiline: false,
    fontSize: 10,
  });

  ensureSpace(30);
  y += 10;
  doc.line(left, y, left + 55, y);
  doc.line(pageWidth - right - 30, y, pageWidth - right, y);
  y += 6;
  doc.text("Accountability partner signature", left, y);
  doc.text("Date", pageWidth - right - 25, y);
  addEditableTextField(doc, {
    name: nextFieldName("accountability_signature"),
    x: left,
    y: y - 10.5,
    width: 55,
    height: 6.8,
    multiline: false,
    fontSize: 10,
  });
  addEditableTextField(doc, {
    name: nextFieldName("accountability_date"),
    x: pageWidth - right - 30,
    y: y - 10.5,
    width: 30,
    height: 6.8,
    multiline: false,
    fontSize: 10,
  });
}

function drawItemExplanationsPages(doc, reportState, middlePageDataUrl) {
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
      effectiveExplanation,
      middlePageDataUrl
    );
  });
  return pageMap;
}

function drawThankYouPage(doc) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setTextColor(...RED_600);
  doc.setFont("times", "bold");
  doc.setFontSize(76);
  doc.text("Thank You", width / 2, height / 2 - 10, { align: "center" });
  doc.setFont("times", "bolditalic");
  doc.setFontSize(38);
  doc.text("For your commitment to growth.", width / 2, height / 2 + 10, {
    align: "center",
  });
  doc.setTextColor(0, 0, 0);
}

export async function generateReportPdf(reportState) {
  const doc = new jsPDF("p", "mm", "a4");
  let growthJourneyDataUrl = null;
  let firstPageDataUrl = null;
  let middlePageDataUrl = null;
  let lastPageDataUrl = null;
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

  try {
    firstPageDataUrl = await toDataUrl("/pdf-images-section/first.png");
  } catch {
    firstPageDataUrl = null;
  }
  try {
    middlePageDataUrl = await toDataUrl("/pdf-images-section/middle.png");
  } catch {
    middlePageDataUrl = null;
  }
  try {
    lastPageDataUrl = await toDataUrl("/pdf-images-section/last.png");
  } catch {
    lastPageDataUrl = null;
  }

  drawPageBackground(doc, firstPageDataUrl);
  drawCoverPage(doc, reportState, growthJourneyDataUrl);
  doc.addPage();
  drawPageBackground(doc, middlePageDataUrl);
  drawIntroPage(doc, reportState);
  doc.addPage();
  drawPageBackground(doc, middlePageDataUrl);
  const selectionPageNumber = doc.getNumberOfPages();
  const itemPageMap = drawItemExplanationsPages(doc, reportState, middlePageDataUrl);
  doc.setPage(selectionPageNumber);
  drawSelectionPage(doc, reportState, itemPageMap);

  doc.addPage();
  drawPageBackground(doc, lastPageDataUrl);
  drawThankYouPage(doc);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages) {
      continue;
    }
    doc.setPage(i);
    drawMiddlePageFooter(doc, i, totalPages);
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
