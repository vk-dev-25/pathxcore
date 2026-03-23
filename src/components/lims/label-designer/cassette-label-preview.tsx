"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CassetteLabelPreview() {
  const [specimenId, setSpecimenId] = useState("PX-ACC-2501001-BN-001");
  const [tissueAbbrev, setTissueAbbrev] = useState("BN");
  const [mouseId, setMouseId] = useState("M12");
  const [blockedDate, setBlockedDate] = useState(new Date().toISOString().split("T")[0]);
  const [orientationNote, setOrientationNote] = useState("");
  const [labelType, setLabelType] = useState<"printed" | "handwritten">("printed");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="space-y-1.5">
          <Label>Specimen ID</Label>
          <Input value={specimenId} onChange={(e) => setSpecimenId(e.target.value)} className="font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label>Tissue Abbreviation</Label>
          <Input value={tissueAbbrev} onChange={(e) => setTissueAbbrev(e.target.value)} maxLength={3} className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Mouse ID</Label>
          <Input value={mouseId} onChange={(e) => setMouseId(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Blocked Date</Label>
          <Input type="date" value={blockedDate} onChange={(e) => setBlockedDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Cassette Label Type</Label>
          <Select value={labelType} onValueChange={(v) => setLabelType(v as typeof labelType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="printed">Printed Cassette Label</SelectItem>
              <SelectItem value="handwritten">Handwritten on Cassette</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Orientation Note</Label>
          <Input value={orientationNote} onChange={(e) => setOrientationNote(e.target.value)} placeholder="Ink dot medial..." />
        </div>
      </div>

      {/* Preview */}
      <div className="flex gap-8 flex-wrap">
        {labelType === "printed" ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Printed Cassette Label</p>
            <div className="w-48 h-28 border-2 border-border rounded bg-white text-black p-2 font-mono shadow-sm flex flex-col justify-between" style={{ fontSize: "9px" }}>
              <div className="font-bold text-[10px] leading-tight break-all">{specimenId || "—"}</div>
              <div className="space-y-0.5 text-[9px]">
                <div><span className="text-gray-400">Tissue:</span> {tissueAbbrev?.toUpperCase() || "—"}</div>
                <div><span className="text-gray-400">Mouse:</span> {mouseId || "—"}</div>
                <div><span className="text-gray-400">Blocked:</span> {blockedDate || "—"}</div>
                {orientationNote && <div><span className="text-gray-400">Orient:</span> {orientationNote}</div>}
              </div>
              <div className="text-[8px] text-gray-400 text-center">PathxDx</div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Handwritten Cassette</p>
            <div className="w-48 h-28 border-2 border-border rounded bg-amber-50 text-black p-2 shadow-sm flex flex-col justify-between" style={{ fontFamily: "cursive", fontSize: "10px" }}>
              <div className="border-b border-gray-300 pb-1">{specimenId || "_______________"}</div>
              <div className="border-b border-gray-300 pb-1">{tissueAbbrev?.toUpperCase() || "___"} · {mouseId || "___"}</div>
              <div className="border-b border-gray-300 pb-1">{blockedDate || "___/___/___"}</div>
              <div className="text-gray-400 text-[9px]">{orientationNote || "orientation: ___"}</div>
            </div>
          </div>
        )}
      </div>

      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />Print
      </Button>
    </div>
  );
}
