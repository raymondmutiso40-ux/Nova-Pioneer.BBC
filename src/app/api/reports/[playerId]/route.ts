import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/apiAuth";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Svg, Line as SvgLine, Polyline, Circle } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  header: { backgroundColor: "#0b1e3d", color: "#d4a83f", padding: 14, marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: 700 },
  headerSub: { fontSize: 9, color: "#ffffff", marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: "#0b1e3d", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  statBox: { border: "1px solid #eee", borderRadius: 4, padding: 8, width: "23%" },
  statLabel: { fontSize: 8, color: "#666" },
  statValue: { fontSize: 14, fontWeight: 700, color: "#0b1e3d" },
  tableHeader: { flexDirection: "row", backgroundColor: "#0b1e3d", color: "#fff", padding: 6 },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #eee" },
  cell: { flex: 1, fontSize: 9 },
  chart: { border: "1px solid #eee", padding: 10, marginTop: 4 },
  graph: { border: "1px solid #eee", padding: 10, marginTop: 4 },
  graphLegend: { fontSize: 8, color: "#666", marginTop: 4 },
  footer: { marginTop: 24, fontSize: 8, color: "#999", textAlign: "center" },
});

export async function GET(req: NextRequest, { params }: { params: { playerId: string } }) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const player = await prisma.player.findUnique({
    where: { id: params.playerId },
    include: {
      assessments: { orderBy: { week: "asc" }, include: { session: true } },
      attendances: { include: { session: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const attendancePct = player.attendances.length
    ? Math.round(
        (player.attendances.filter((a) => a.status === "Present").length / player.attendances.length) * 100
      )
    : 0;

  const scores = player.assessments.map((a) => a.avgScore);
  const avgOverall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const growth =
    scores.length >= 2 ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0]) * 100) : 0;
  const bestWeek = player.assessments.reduce(
    (best, a) => (a.avgScore > (best?.avgScore ?? 0) ? a : best),
    player.assessments[0]
  );
  const graphWidth = 500;
  const graphHeight = 130;
  const graphLeft = 32;
  const graphRight = 490;
  const graphTop = 10;
  const graphBottom = 108;
  const graphPoints = player.assessments.map((assessment, index) => {
    const x = player.assessments.length === 1
      ? (graphLeft + graphRight) / 2
      : graphLeft + (index * (graphRight - graphLeft)) / (player.assessments.length - 1);
    const score = Math.max(40, Math.min(100, assessment.avgScore));
    const y = graphBottom - ((score - 40) / 60) * (graphBottom - graphTop);
    return { x, y, week: assessment.week, score: Math.round(assessment.avgScore) };
  });

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, "NOVA PIONEER BASKETBALL"),
        React.createElement(Text, { style: styles.headerSub }, "Confidential Player Development Report")
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, player.name),
        React.createElement(
          Text,
          { style: { fontSize: 9, color: "#666", marginBottom: 8 } },
          `Grade ${player.grade} • ${player.position} • Status: ${player.status}`
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            View,
            { style: styles.statBox },
            React.createElement(Text, { style: styles.statLabel }, "Attendance"),
            React.createElement(Text, { style: styles.statValue }, `${attendancePct}%`)
          ),
          React.createElement(
            View,
            { style: styles.statBox },
            React.createElement(Text, { style: styles.statLabel }, "Avg Skill Score"),
            React.createElement(Text, { style: styles.statValue }, `${avgOverall}`)
          ),
          React.createElement(
            View,
            { style: styles.statBox },
            React.createElement(Text, { style: styles.statLabel }, "Growth"),
            React.createElement(Text, { style: styles.statValue }, `${growth >= 0 ? "+" : ""}${growth}%`)
          ),
          React.createElement(
            View,
            { style: styles.statBox },
            React.createElement(Text, { style: styles.statLabel }, "Best Week"),
            React.createElement(Text, { style: styles.statValue }, bestWeek ? `W${bestWeek.week}` : "-")
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Weekly Assessment History"),
        React.createElement(
          View,
          { style: styles.graph },
          React.createElement(Text, { style: { fontSize: 9, color: "#0b1e3d", marginBottom: 4 } }, "Performance by Week (average skill score)"),
          player.assessments.length > 0
            ? React.createElement(
                Svg,
                { width: graphWidth, height: graphHeight, viewBox: `0 0 ${graphWidth} ${graphHeight}` },
                ...[40, 70, 100].map((value) => {
                  const y = graphBottom - ((value - 40) / 60) * (graphBottom - graphTop);
                  return React.createElement(
                    SvgLine,
                    { key: `grid-${value}`, x1: graphLeft, y1: y, x2: graphRight, y2: y, stroke: "#dfe3ea", strokeWidth: 1 }
                  );
                }),
                React.createElement(SvgLine, { x1: graphLeft, y1: graphTop, x2: graphLeft, y2: graphBottom, stroke: "#0b1e3d", strokeWidth: 1 }),
                React.createElement(SvgLine, { x1: graphLeft, y1: graphBottom, x2: graphRight, y2: graphBottom, stroke: "#0b1e3d", strokeWidth: 1 }),
                React.createElement(Polyline, {
                  points: graphPoints.map((point) => `${point.x},${point.y}`).join(" "),
                  fill: "none",
                  stroke: "#d4a83f",
                  strokeWidth: 3,
                }),
                ...graphPoints.flatMap((point) => [
                  React.createElement(Circle, { key: `point-${point.week}`, cx: point.x, cy: point.y, r: 4, fill: "#d4a83f", stroke: "#0b1e3d", strokeWidth: 1 }),
                  React.createElement(Text, { key: `label-${point.week}`, x: point.x - 8, y: graphBottom + 16, style: { fontSize: 8, fill: "#666" } }, `W${point.week}`),
                ]),
                ...[40, 70, 100].map((value) => {
                  const y = graphBottom - ((value - 40) / 60) * (graphBottom - graphTop) + 3;
                  return React.createElement(Text, { key: `axis-${value}`, x: 2, y, style: { fontSize: 8, fill: "#666" } }, `${value}`);
                })
              )
            : React.createElement(Text, { style: { fontSize: 9, color: "#999" } }, "No assessments recorded"),
          React.createElement(Text, { style: styles.graphLegend }, "Higher scores indicate stronger performance.")
        ),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.cell }, "Week"),
          React.createElement(Text, { style: styles.cell }, "Focus Area"),
          React.createElement(Text, { style: styles.cell }, "Avg Score"),
          React.createElement(Text, { style: styles.cell }, "Notes")
        ),
        ...player.assessments.map((a) =>
          React.createElement(
            View,
            { style: styles.tableRow, key: a.id },
            React.createElement(Text, { style: styles.cell }, `Week ${a.week}`),
            React.createElement(Text, { style: styles.cell }, a.focusArea),
            React.createElement(Text, { style: styles.cell }, `${a.avgScore}`),
            React.createElement(Text, { style: styles.cell }, a.notes || "-")
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Attendance History"),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.cell }, "Date"),
          React.createElement(Text, { style: styles.cell }, "Status")
        ),
        ...player.attendances.map((a) =>
          React.createElement(
            View,
            { style: styles.tableRow, key: `attendance-${a.id}` },
            React.createElement(Text, { style: styles.cell }, new Date(a.session.date).toLocaleDateString()),
            React.createElement(Text, { style: styles.cell }, a.status)
          )
        )
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        `Nova Pioneer Athletics • Player Development Program • Generated: ${new Date().toLocaleDateString()}`
      )
    )
  );

  const buffer = await renderToBuffer(doc as any);

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${player.name.replace(/\s+/g, "_")}_Report.pdf"`,
    },
  });
}
