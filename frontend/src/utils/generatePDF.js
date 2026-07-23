import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export function generatePDFReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addSectionTitle = (title) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text(title, 14, y);
        y += 2;
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 8;
    };

    const addText = (text, fontSize = 10, color = [51, 51, 51]) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text || ""), pageWidth - 28);
        doc.text(lines, 14, y);
        y += lines.length * (fontSize * 0.5) + 4;
    };

    const addBulletList = (items, color = [51, 51, 51]) => {
        if (!items || !Array.isArray(items)) return;
        items.forEach((item) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            doc.setTextColor(...color);
            const text = `\u2022 ${String(item || "")}`;
            const lines = doc.splitTextToSize(text, pageWidth - 32);
            doc.text(lines, 18, y);
            y += lines.length * 5 + 3;
        });
    };

    // ──────── Header ────────
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("ResuMatch AI Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })}`, pageWidth / 2, 30, { align: "center" });

    doc.setTextColor(107, 114, 128);
    doc.text("AI-Generated Estimate - Not an Official ATS Result", pageWidth / 2, 38, { align: "center" });

    y = 55;

    // ──────── Score Summary ────────
    addSectionTitle("Score Summary");

    autoTable(doc, {
        startY: y,
        head: [["Metric", "Score"]],
        body: [
            ["Semantic Match Score", `${data.matchScore || 0}%`],
            ["Skill Match Percentage", `${data.skillMatchPercent || 0}%`],
            ["Overall Match Score", `${data.overallScore || 0}%`],
            ["ATS Compatibility Score", `${data.atsScore || 0}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 12;

    // ──────── Resume Skills ────────
    if (data.resumeSkills && data.resumeSkills.length > 0) {
        addSectionTitle("Resume Skills");
        addText(data.resumeSkills.join(", "), 10, [34, 197, 94]);
        y += 4;
    }

    // ──────── Matched Skills ────────
    if (data.matchedSkills && data.matchedSkills.length > 0) {
        addSectionTitle("Matched Skills");
        addText(data.matchedSkills.join(", "), 10, [59, 130, 246]);
        y += 4;
    }

    // ──────── Missing Skills ────────
    if (data.missingSkills && data.missingSkills.length > 0) {
        addSectionTitle("Missing Skills");
        addText(data.missingSkills.join(", "), 10, [239, 68, 68]);
        y += 4;
    }

    // ──────── Strengths ────────
    if (data.strengths && data.strengths.length > 0) {
        addSectionTitle("Strengths");
        addBulletList(data.strengths, [34, 197, 94]);
        y += 4;
    }

    // ──────── Weaknesses ────────
    if (data.weaknesses && data.weaknesses.length > 0) {
        addSectionTitle("Weaknesses");
        addBulletList(data.weaknesses, [245, 158, 11]);
        y += 4;
    }

    // ──────── Suggestions ────────
    if (data.suggestions && data.suggestions.length > 0) {
        addSectionTitle("Suggestions");
        addBulletList(data.suggestions);
        y += 4;
    }

    // ──────── Overall AI Feedback ────────
    if (data.overallFeedback) {
        addSectionTitle("Overall AI Feedback");
        addText(data.overallFeedback);
        y += 4;
    }

    // ──────── ATS Analysis ────────
    if (data.atsAnalysis) {
        addSectionTitle("ATS Compatibility Analysis");
        if (data.atsAnalysis.formattingFeedback) {
            addText(`Formatting: ${data.atsAnalysis.formattingFeedback}`);
        }
        if (data.atsAnalysis.keywordCoverage) {
            addText(`Keyword Coverage: ${data.atsAnalysis.keywordCoverage}`);
        }
        if (data.atsAnalysis.experienceQuality) {
            addText(`Experience Quality: ${data.atsAnalysis.experienceQuality}`);
        }
        if (data.atsAnalysis.projectQuality) {
            addText(`Project Quality: ${data.atsAnalysis.projectQuality}`);
        }
        if (data.atsAnalysis.missingAreas && data.atsAnalysis.missingAreas.length > 0) {
            y += 2;
            addText("Missing Areas:", 10, [239, 68, 68]);
            addBulletList(data.atsAnalysis.missingAreas, [239, 68, 68]);
        }
        y += 4;
    }

    // ──────── Interview Questions ────────
    if (data.interviewQuestions && data.interviewQuestions.length > 0) {
        addSectionTitle("Interview Questions");
        data.interviewQuestions.forEach((q, i) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            addText(`${i + 1}. [${q.type || "General"}] ${q.question || ""}`, 10, [51, 51, 51]);
            if (q.skill) {
                addText(`   Related Skill: ${q.skill}`, 9, [107, 114, 128]);
            }
        });
        y += 4;
    }

    // ──────── Learning Roadmap ────────
    if (data.learningRoadmap) {
        addSectionTitle("Learning Roadmap");

        const { highPriority, mediumPriority, lowPriority } = data.learningRoadmap;

        if (highPriority && highPriority.length > 0) {
            addText("HIGH PRIORITY", 11, [239, 68, 68]);
            highPriority.forEach((item) => {
                addText(`- ${item.skill || ""}: ${item.reason || ""}`, 10, [51, 51, 51]);
            });
            y += 2;
        }

        if (mediumPriority && mediumPriority.length > 0) {
            addText("MEDIUM PRIORITY", 11, [245, 158, 11]);
            mediumPriority.forEach((item) => {
                addText(`- ${item.skill || ""}: ${item.reason || ""}`, 10, [51, 51, 51]);
            });
            y += 2;
        }

        if (lowPriority && lowPriority.length > 0) {
            addText("LOW PRIORITY", 11, [34, 197, 94]);
            lowPriority.forEach((item) => {
                addText(`- ${item.skill || ""}: ${item.reason || ""}`, 10, [51, 51, 51]);
            });
        }
    }

    // ──────── Footer ────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `ResuMatch AI Report - Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    doc.save(`ResuMatch_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}
