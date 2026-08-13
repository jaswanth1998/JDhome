/**
 * The JD Home Services invoice / estimate document.
 *
 * This is the SINGLE source of truth: the on-screen preview (<PDFViewer>) and
 * the PDF that gets emailed are produced by the same renderer, so they cannot
 * drift apart.
 *
 * Uses the built-in Helvetica family (metric-compatible with the Arial used in
 * the original Word template) so there is no webfont fetch at render time.
 */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { JDDocumentData } from "./types";
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from "./settings";

/**
 * Served from public/. `logo-pdf.png` is a 300px copy of the full-resolution
 * `logo.png` — react-pdf embeds the source bytes verbatim, so the full 290 kB
 * original would land in every PDF.
 */
export const DEFAULT_LOGO_SRC = "/images/logo-pdf.png";

const NAVY = "#1B3A5F";
const GOLD = "#B8912F";
const GOLD_BAR = "#C2A14D";
const RULE = "#C9A44C";
const MUTED = "#4A5568";
const INK = "#1F2937";

const s = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 8.6,
    color: INK,
    lineHeight: 1.45,
  },

  mast: { flexDirection: "row", justifyContent: "space-between" },
  brand: { width: 250 },
  logo: { width: 76, height: 76, objectFit: "contain" },
  tagline: {
    color: GOLD,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.2,
    letterSpacing: 0.3,
    marginTop: 6,
    marginBottom: 7,
  },
  metaRow: { flexDirection: "row", marginBottom: 1 },
  metaKey: { width: 48, color: "#24303F", fontSize: 7.6 },
  metaVal: { color: "#24303F", fontSize: 7.6 },

  docBlock: {
    backgroundColor: NAVY,
    width: 184,
    minHeight: 102,
    paddingVertical: 18,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  docTitle: {
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    fontSize: 20,
    letterSpacing: 1,
    lineHeight: 1.2,
    marginBottom: 9,
  },
  docNo: { fontFamily: "Helvetica-Bold", color: RULE, fontSize: 8 },

  rule: { borderTopWidth: 1.1, borderTopColor: RULE, marginTop: 20 },

  billRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  label: {
    color: GOLD,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.4,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  who: { fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 10.5 },
  addr: { color: MUTED, fontSize: 7.8, marginTop: 2 },
  dateCol: { flexDirection: "row" },
  dateBlock: { marginLeft: 34 },
  dateKey: { fontFamily: "Helvetica-Bold", fontSize: 8 },
  dateVal: { fontSize: 8 },

  table: { marginTop: 24 },
  th: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  thText: {
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    fontSize: 7,
    letterSpacing: 0.5,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.7,
    borderBottomColor: "#E8EAEE",
  },
  cDesc: { flex: 1 },
  cQty: { width: 52, textAlign: "right" },
  cRate: { width: 74, textAlign: "right" },
  cAmt: { width: 82, textAlign: "right" },
  cell: { fontSize: 8 },

  summary: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  notes: { width: 228 },
  notesH: { fontFamily: "Helvetica-Bold", fontSize: 8, marginBottom: 2 },
  notesB: { fontSize: 7.8, color: MUTED },
  totals: { width: 184 },
  totRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  totRuled: { borderTopWidth: 0.7, borderTopColor: "#D8DCE2" },
  totKey: { fontSize: 8 },
  totVal: { fontSize: 8 },
  dueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  dueKey: { fontFamily: "Helvetica-Bold", color: "#FFFFFF", fontSize: 8.6 },
  dueVal: { fontFamily: "Helvetica-Bold", color: RULE, fontSize: 8.6 },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  footT: {
    color: GOLD,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.4,
    letterSpacing: 0.3,
  },
  footS: { fontSize: 7.6, color: MUTED, marginTop: 2 },
  badge: {
    backgroundColor: GOLD_BAR,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.9,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },

  sec: { fontFamily: "Helvetica-Bold", fontSize: 8.6, marginBottom: 6 },
  para: { fontSize: 7.7, marginBottom: 9, textAlign: "left" },
  sigBox: {
    width: 174,
    height: 46,
    borderBottomWidth: 0.8,
    borderBottomColor: "#9AA3AE",
    borderBottomStyle: "dashed",
    justifyContent: "flex-end",
    marginTop: 3,
  },
  sigImg: { maxHeight: 44, objectFit: "contain", objectPositionX: 0 },
  li: { flexDirection: "row", marginBottom: 1.5 },
  liDot: { width: 10, fontSize: 7.7 },
  liText: { fontSize: 7.7, flex: 1 },
  payLine: { fontSize: 7.7 },
  payBold: { fontFamily: "Helvetica-Bold", fontSize: 7.7 },
});

function money(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "";
  const f = Number(v);
  // Whole dollars print bare ($250) to match the original template; anything
  // with cents prints two decimals. Both keep thousands separators.
  const decimals = f === Math.round(f) ? 0 : 2;
  return `$${f.toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 2,
  })}`;
}

export function JDDocument({
  data,
  logoSrc = DEFAULT_LOGO_SRC,
  settings = DEFAULT_DOCUMENT_SETTINGS,
}: {
  data: JDDocumentData;
  /** Overridable so the document can be rendered outside the browser (tests). */
  logoSrc?: string;
  /** Editable copy from jdhome.document_settings. */
  settings?: DocumentSettings;
}) {
  const isEstimate = data.kind === "estimate";
  const title = isEstimate ? "ESTIMATE" : "INVOICE";
  const { client, meta } = data;
  const items = [...data.items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const hstLabel = `${(Number(meta.hst_rate ?? 0.13) * 100).toFixed(0)}%`;
  const sig = (client.client_signature ?? "").trim();

  return (
    <Document
      title={`${title} ${meta.number}`}
      author="JD Home Services"
      subject={`${title} ${meta.number}`}
    >
      {/* ---------------- Page 1 ---------------- */}
      <Page size="LETTER" style={s.page}>
        <View style={s.mast}>
          <View style={s.brand}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.tagline}>{settings.tagline}</Text>

            {[
              ["Phone:", settings.companyPhone],
              ["Email:", settings.companyEmail],
              ["Web:", settings.companyWeb],
              ["Address:", settings.companyAddress],
              ["GST/HST:", settings.companyGst],
            ].map(([k, v]) => (
              <View key={k} style={s.metaRow}>
                <Text style={s.metaKey}>{k}</Text>
                <Text style={s.metaVal}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={s.docBlock}>
            <Text style={s.docTitle}>{title}</Text>
            <Text style={s.docNo}>No.  {meta.number}</Text>
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.billRow}>
          <View>
            <Text style={s.label}>BILL TO</Text>
            <Text style={s.who}>{client.name || ""}</Text>
            {!!client.address && <Text style={s.addr}>{client.address}</Text>}
          </View>
          <View style={s.dateCol}>
            <View style={s.dateBlock}>
              <Text style={s.dateKey}>
                {isEstimate ? "Estimate Date:" : "Invoice Date:"}
              </Text>
              <Text style={s.dateVal}>{meta.date || ""}</Text>
            </View>
            {isEstimate && !!meta.valid_until && (
              <View style={s.dateBlock}>
                <Text style={s.dateKey}>Valid Until:</Text>
                <Text style={s.dateVal}>{meta.valid_until}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.table}>
          <View style={s.th} fixed>
            <Text style={[s.thText, s.cDesc]}>DESCRIPTION</Text>
            <Text style={[s.thText, s.cQty]}>QTY</Text>
            <Text style={[s.thText, s.cRate]}>RATE</Text>
            <Text style={[s.thText, s.cAmt]}>AMOUNT</Text>
          </View>
          {items.length === 0 && (
            <View style={s.tr}>
              <Text style={[s.cell, s.cDesc, { color: "#8A94A2" }]}>
                No line items
              </Text>
            </View>
          )}
          {items.map((it, i) => (
            <View key={i} style={s.tr} wrap={false}>
              <Text style={[s.cell, s.cDesc]}>
                {(it.description || "").trim()}
              </Text>
              <Text style={[s.cell, s.cQty]}>{it.quantity ?? ""}</Text>
              <Text style={[s.cell, s.cRate]}>{money(it.rate)}</Text>
              <Text style={[s.cell, s.cAmt]}>{money(it.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={s.summary}>
          <View style={s.notes}>
            <Text style={s.notesH}>Notes :</Text>
            {!!meta.notes && <Text style={s.notesB}>{meta.notes}</Text>}
          </View>
          <View style={s.totals}>
            <View style={s.totRow}>
              <Text style={s.totKey}>Subtotal</Text>
              <Text style={s.totVal}>{money(meta.subtotal)}</Text>
            </View>
            <View style={[s.totRow, s.totRuled]}>
              <Text style={s.totKey}>HST ({hstLabel})</Text>
              <Text style={s.totVal}>{money(meta.hst_amount)}</Text>
            </View>
            <View style={s.dueRow}>
              <Text style={s.dueKey}>{isEstimate ? "TOTAL" : "TOTAL DUE"}</Text>
              <Text style={s.dueVal}>{money(meta.total)}</Text>
            </View>
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.footer}>
          <View>
            <Text style={s.footT}>{settings.tagline}</Text>
            <Text style={s.footS}>{settings.footerThanks}</Text>
          </View>
          <Text style={s.badge}>{settings.footerBadge}</Text>
        </View>
      </Page>

      {/* ---------------- Page 2 ---------------- */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.sec}>Terms:</Text>

        {isEstimate ? (
          settings.estimateTerms.map((clause) => (
            <Text key={clause.title} style={s.para}>
              <Text style={s.payBold}>{clause.title}. </Text>
              {clause.body}
            </Text>
          ))
        ) : (
          <Text style={s.para}>{settings.invoiceTerms}</Text>
        )}

        <View style={{ marginTop: 14 }}>
          <Text style={s.sec}>Client Signature:</Text>
          <View style={s.sigBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {!!sig && <Image src={sig} style={s.sigImg} />}
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={s.sec}>Payment Options:</Text>
          {settings.paymentOptions.map((line) => (
            <View key={line} style={s.li}>
              <Text style={s.liDot}>-</Text>
              <Text style={s.liText}>{line}</Text>
            </View>
          ))}

          <View style={{ marginTop: 10 }}>
            <Text style={s.payBold}>Cheque by Mail:</Text>
            <Text style={s.payLine}>Please make the cheque payable to:</Text>
            <Text style={s.payLine}>{settings.chequePayableTo}</Text>
            <Text style={s.payLine}>And mail it to:</Text>
            <Text style={s.payLine}>{settings.chequeMailTo}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
