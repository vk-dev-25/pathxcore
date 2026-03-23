"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LabelPreview() {
  const [slideId, setSlideId] = useState("PX-ACC-2501001-BN-001-001");
  const [mouseId, setMouseId] = useState("M12");
  const [tissueAbbrev, setTissueAbbrev] = useState("BN");
  const [cutDate, setCutDate] = useState(new Date().toISOString().split("T")[0]);
  const [labelType, setLabelType] = useState<"direct_print" | "adhesive">("adhesive");
  const [stainHandwritten, setStainHandwritten] = useState("");

  function handlePrint() {
    const printArea = document.getElementById("slide-label-print");
    if (!printArea) return;
    const w = window.open("", "_blank", "width=400,height=300");
    if (!w) return;
    w.document.write(`
      <html><head><title>Slide Label</title>
      <style>
        body { margin: 0; font-family: monospace; }
        .label { width: 288px; height: 96px; border: 1px solid #000; padding: 4px 6px; font-size: 8px; display: flex; flex-direction: column; justify-content: space-between; }
        .main-id { font-size: 10px; font-weight: bold; }
        .stain-line { border-top: 1px solid #ccc; margin-top: 4px; padding-top: 2px; font-style: italic; color: #999; }
      </style></head><body>${printArea.innerHTML}</body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="space-y-1.5">
          <Label>Slide ID</Label>
          <Input value={slideId} onChange={(e) => setSlideId(e.target.value)} className="font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label>Mouse ID</Label>
          <Input value={mouseId} onChange={(e) => setMouseId(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Tissue Abbreviation</Label>
          <Input value={tissueAbbrev} onChange={(e) => setTissueAbbrev(e.target.value)} maxLength={3} className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Cut Date</Label>
          <Input type="date" value={cutDate} onChange={(e) => setCutDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Label Type</Label>
          <Select value={labelType} onValueChange={(v) => setLabelType(v as typeof labelType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="direct_print">Direct Print on Glass</SelectItem>
              <SelectItem value="adhesive">Xylene-Resistant Adhesive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Stain (handwritten, optional)</Label>
          <Input value={stainHandwritten} onChange={(e) => setStainHandwritten(e.target.value)} placeholder="Ki-67 · 22/01/25" />
        </div>
      </div>

      {/* Label previews */}
      <div className="flex gap-8 items-start flex-wrap">
        {/* At cut time */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">At Cut Time (printed)</p>
          <div
            id="slide-label-print"
            className="w-72 h-24 border-2 border-border rounded bg-white text-black p-1.5 font-mono flex flex-col justify-between shadow-sm"
            style={{ fontSize: "9px" }}
          >
            <div>
              <div className="font-bold text-[11px] leading-tight">{slideId || "—"}</div>
              <div className="flex gap-3 mt-0.5 text-[9px]">
                <span><span className="text-gray-400">Mouse:</span> {mouseId || "—"}</span>
                <span><span className="text-gray-400">Tissue:</span> {tissueAbbrev?.toUpperCase() || "—"}</span>
              </div>
              <div className="text-[9px] text-gray-500">Cut: {cutDate || "—"}</div>
              <div className="text-[9px] text-gray-400">Type: {labelType === "direct_print" ? "Direct print" : "Adhesive"}</div>
            </div>
            <div className="border-t border-gray-200 pt-1 text-[9px] text-gray-300 italic">
              Stain: ___________________________
            </div>
          </div>
        </div>

        {/* After handwriting */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">After Staining (handwritten)</p>
          <div
            className="w-72 h-24 border-2 border-border rounded bg-white text-black p-1.5 font-mono flex flex-col justify-between shadow-sm"
            style={{ fontSize: "9px" }}
          >
            <div>
              <div className="font-bold text-[11px] leading-tight">{slideId || "—"}</div>
              <div className="flex gap-3 mt-0.5 text-[9px]">
                <span><span className="text-gray-400">Mouse:</span> {mouseId || "—"}</span>
                <span><span className="text-gray-400">Tissue:</span> {tissueAbbrev?.toUpperCase() || "—"}</span>
              </div>
              <div className="text-[9px] text-gray-500">Cut: {cutDate || "—"}</div>
              <div className="text-[9px] text-gray-400">Type: {labelType === "direct_print" ? "Direct print" : "Adhesive"}</div>
            </div>
            <div className="border-t border-gray-200 pt-1 text-[9px] text-gray-600">
              Stain: <span className="font-semibold not-italic">{stainHandwritten || <span className="text-gray-300 italic">not yet written</span>}</span>
            </div>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4" />Print Label
      </Button>
    </div>
  );
}
