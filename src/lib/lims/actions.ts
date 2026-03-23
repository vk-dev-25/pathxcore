'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  generateProjectId,
  generateAccessionId,
  generateSpecimenId,
  generateBlockId,
  generateSlideId,
  generateInhouseLibraryId,
} from './id-gen'
import type {
  ClientInsert, ProjectInsert, AccessionInsert,
  SpecimenInsert, BlockInsert, SlideInsert,
  IhcAssayProjectInsert, IhcOptimizationRunInsert,
  InhouseLibraryInsert, TissueAbbreviation,
} from './types'

type ActionResult<T = unknown> = { data: T | null; error: string | null }

// ---- Clients ----

export async function createClientAction(
  input: ClientInsert
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').insert(input).select().single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/clients')
  return { data, error: null }
}

// ---- Projects ----

export async function createProjectAction(
  input: Omit<ProjectInsert, 'project_id'>
): Promise<ActionResult> {
  const supabase = await createClient()
  // Fetch client code
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('code')
    .eq('id', input.client_id)
    .single()
  if (clientErr || !client) return { data: null, error: 'Client not found' }
  const year = new Date().getFullYear()
  try {
    const project_id = await generateProjectId(supabase, client.code, year)
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...input, project_id })
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    revalidatePath('/pathx/lims/projects')
    return { data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// ---- Accessions ----

export async function createAccessionAction(
  input: Omit<AccessionInsert, 'accession_id'>
): Promise<ActionResult> {
  const supabase = await createClient()
  try {
    const accession_id = await generateAccessionId(supabase, new Date(input.received_date))
    const { data, error } = await supabase
      .from('accessions')
      .insert({ ...input, accession_id })
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    revalidatePath('/pathx/lims/accessions')
    return { data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

export async function updateAccessionStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accessions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/accessions')
  return { data, error: null }
}

// ---- Specimens ----

export async function createSpecimenAction(
  input: Omit<SpecimenInsert, 'specimen_id'> & {
    accession_db_id: string
    accession_id_str: string
    tissue_abbreviation: string
    cell_line?: string | null
    overexpressed_marker?: string | null
  }
): Promise<ActionResult> {
  const supabase = await createClient()
  try {
    const specimen_id = await generateSpecimenId(
      supabase,
      input.accession_id_str,
      input.tissue_abbreviation,
      input.cell_line ?? undefined,
      input.overexpressed_marker ?? undefined
    )
    const { accession_id_str: _acc, accession_db_id: _dbId, ...rest } = input
    const { data, error } = await supabase
      .from('specimens')
      .insert({ ...rest, specimen_id })
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    revalidatePath('/pathx/lims/specimens')
    return { data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// ---- Blocks ----

export async function createBlockAction(
  input: Omit<BlockInsert, 'block_id'> & { specimen_id_str: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  try {
    const block_id = await generateBlockId(supabase, input.specimen_id_str)
    const { specimen_id_str: _, ...rest } = input
    const { data, error } = await supabase
      .from('blocks')
      .insert({ ...rest, block_id })
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    revalidatePath('/pathx/lims/specimens')
    return { data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// ---- Slides ----

export async function createSlideAction(
  input: Omit<SlideInsert, 'slide_id'> & { specimen_id_str: string; count?: number }
): Promise<ActionResult> {
  const supabase = await createClient()
  try {
    const count = input.count ?? 1
    const slides = []
    for (let i = 0; i < count; i++) {
      const slide_id = await generateSlideId(supabase, input.specimen_id_str)
      // Get current max section number
      const { count: existing } = await supabase
        .from('slides')
        .select('id', { count: 'exact', head: true })
        .eq('specimen_id', input.specimen_id)
      const section_number = (existing ?? 0) + 1 - (count - 1 - i)
      const { specimen_id_str: _, count: __, ...rest } = input
      slides.push({ ...rest, slide_id, section_number })
    }
    const { data, error } = await supabase.from('slides').insert(slides).select()
    if (error) return { data: null, error: error.message }
    revalidatePath('/pathx/lims/slides')
    return { data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

export async function updateSlideStainAction(
  id: string,
  update: {
    stain_status?: string
    stain_type?: string
    marker?: string
    isotype_control?: string
    stained_date?: string
    stained_by?: string
  }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('slides')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/slides')
  return { data, error: null }
}

// ---- IHC Assay Development ----

export async function createAssayProjectAction(
  input: IhcAssayProjectInsert
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ihc_assay_projects')
    .insert(input)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/ihc-assay-dev')
  return { data, error: null }
}

export async function createOptimizationRunAction(
  input: IhcOptimizationRunInsert
): Promise<ActionResult> {
  const supabase = await createClient()
  // Get next run number
  const { count } = await supabase
    .from('ihc_optimization_runs')
    .select('id', { count: 'exact', head: true })
    .eq('assay_project_id', input.assay_project_id)
  const run_number = (count ?? 0) + 1
  const { data, error } = await supabase
    .from('ihc_optimization_runs')
    .insert({ ...input, run_number })
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/ihc-assay-dev')
  return { data, error: null }
}

export async function updateRunOutcomeAction(
  id: string,
  outcome: 'pass' | 'fail' | 'pending'
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ihc_optimization_runs')
    .update({ outcome })
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/ihc-assay-dev')
  return { data, error: null }
}

export async function lockAssayProjectAction(
  assayProjectId: string,
  lockedRunId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ihc_assay_projects')
    .update({ status: 'locked', locked_run_id: lockedRunId })
    .eq('id', assayProjectId)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/ihc-assay-dev')
  return { data, error: null }
}

export async function addIhcControlAction(input: {
  assay_project_id: string
  control_type: 'client_supplied' | 'inhouse'
  accession_id?: string
  inhouse_library_id?: string
  role: 'positive' | 'negative'
  notes?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ihc_controls')
    .insert(input)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/ihc-assay-dev')
  return { data, error: null }
}

// ---- In-House Library ----

export async function createInhouseEntryAction(
  input: Omit<InhouseLibraryInsert, 'library_id'>
): Promise<ActionResult> {
  const supabase = await createClient()
  const library_id = generateInhouseLibraryId(input.marker, input.role)
  const { data, error } = await supabase
    .from('inhouse_library')
    .insert({ ...input, library_id })
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/inhouse-library')
  return { data, error: null }
}

// ---- Tissue Abbreviations ----

export async function createTissueAbbreviationAction(
  input: Omit<TissueAbbreviation, 'id' | 'created_at'>
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tissue_abbreviations')
    .insert(input)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/pathx/lims/tissue-abbreviations')
  return { data, error: null }
}
