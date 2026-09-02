import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/apiAuth";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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
  footer: { marginTop: 24, fontSize: 8, color: "#999", textAlign: "center" },
});

export async function GET(req: NextRequest, { params }: { params: { playerId: string } }) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const player = await prisma.player.findUnique({
    where: { id: params.playerId },
    include: {
      assessments: { orderBy: { week: "asc" }, include: { session: true } },
      attendances: true,
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

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, "NOVA PIONEER GIRLS BASKETBALL"),
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
