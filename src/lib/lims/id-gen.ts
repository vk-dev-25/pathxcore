// PathxDx LIMS — ID Generation (server-only)
// All functions call the next_sequence Postgres RPC for atomic increments

import type { SupabaseClient } from '@supabase/supabase-js'

function pad(n: bigint | number, width: number): string {
  return String(n).padStart(width, '0')
}

// PX-[YYYY]-[CLIENT_CODE]-[###]
export async function generateProjectId(
  supabase: SupabaseClient,
  clientCode: string,
  year: number
): Promise<string> {
  const key = `projects_${clientCode}_${year}`
  const { data, error } = await supabase.rpc('next_sequence', {
    p_table: key,
    p_year: year,
    p_month: 0,
  })
  if (error) throw new Error(`ID gen failed: ${error.message}`)
  return `PX-${year}-${clientCode.toUpperCase()}-${pad(data as number, 3)}`
}

// PX-ACC-YYMM### (e.g. PX-ACC-2501001)
export async function generateAccessionId(
  supabase: SupabaseClient,
  date: Date
): Promise<string> {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const { data, error } = await supabase.rpc('next_sequence', {
    p_table: 'accessions',
    p_year: year,
    p_month: month,
  })
  if (error) throw new Error(`ID gen failed: ${error.message}`)
  return `PX-ACC-${yy}${mm}${pad(data as number, 3)}`
}

// PX-ACC-2501001-BN-001  (tissue/human)
// PX-ACC-2501001-CP-H1975-001  (standard cell pellet)
// PX-ACC-2501001-CP-H1975.HER2-001  (overexpressing)
export async function generateSpecimenId(
  supabase: SupabaseClient,
  accessionId: string,
  tissueAbbrev: string,
  cellLine?: string,
  overexpressedMarker?: string
): Promise<string> {
  let segment: string
  if (tissueAbbrev === 'CP' && cellLine) {
    const lineKey = overexpressedMarker
      ? `${cellLine}.${overexpressedMarker}`
      : cellLine
    segment = `CP-${lineKey}`
  } else {
    segment = tissueAbbrev.toUpperCase()
  }
  const key = `specimens_${accessionId}_${segment}`
  const { data, error } = await supabase.rpc('next_sequence', {
    p_table: key,
    p_year: 0,
    p_month: 0,
  })
  if (error) throw new Error(`ID gen failed: ${error.message}`)
  return `${accessionId}-${segment}-${pad(data as number, 3)}`
}

// {specimenId}-BLK-001
export async function generateBlockId(
  supabase: SupabaseClient,
  specimenId: string
): Promise<string> {
  const key = `blocks_${specimenId}`
  const { data, error } = await supabase.rpc('next_sequence', {
    p_table: key,
    p_year: 0,
    p_month: 0,
  })
  if (error) throw new Error(`ID gen failed: ${error.message}`)
  return `${specimenId}-BLK-${pad(data as number, 3)}`
}

// {specimenId}-001  (plain sequence)
export async function generateSlideId(
  supabase: SupabaseClient,
  specimenId: string
): Promise<string> {
  const key = `slides_${specimenId}`
  const { data, error } = await supabase.rpc('next_sequence', {
    p_table: key,
    p_year: 0,
    p_month: 0,
  })
  if (error) throw new Error(`ID gen failed: ${error.message}`)
  return `${specimenId}-${pad(data as number, 3)}`
}

// PX-IN-HER2-POS
export function generateInhouseLibraryId(marker: string, role: 'positive' | 'negative'): string {
  return `PX-IN-${marker.toUpperCase().replace(/\s+/g, '')}-${role === 'positive' ? 'POS' : 'NEG'}`
}
