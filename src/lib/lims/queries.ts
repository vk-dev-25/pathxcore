// PathxDx LIMS — Read-only Supabase queries
// Accept a pre-created Supabase client from the calling Server Component

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Client, Project, ProjectWithClient, Accession, AccessionWithProject,
  Specimen, SpecimenWithAccession, Block, Slide, SlideWithSpecimen,
  IhcAssayProject, IhcAssayProjectWithProject, AssayProjectFull,
  InhouseLibrary, TissueAbbreviation, DashboardStats,
} from './types'

// ---- Clients ----

export async function getClients(supabase: SupabaseClient): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getClient(supabase: SupabaseClient, id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

// ---- Projects ----

export async function getProjects(
  supabase: SupabaseClient,
  filters?: { status?: string; clientId?: string }
): Promise<ProjectWithClient[]> {
  let query = supabase
    .from('projects')
    .select('*, client:clients(name, code)')
    .order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.clientId) query = query.eq('client_id', filters.clientId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ProjectWithClient[]
}

export async function getProject(
  supabase: SupabaseClient,
  id: string
): Promise<(Project & { client: Pick<Client, 'name' | 'code'> }) | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(name, code)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Project & { client: Pick<Client, 'name' | 'code'> }
}

// ---- Accessions ----

export async function getAccessions(
  supabase: SupabaseClient,
  filters?: { projectId?: string; status?: string }
): Promise<AccessionWithProject[]> {
  let query = supabase
    .from('accessions')
    .select('*, project:projects(project_id, title)')
    .order('created_at', { ascending: false })
  if (filters?.projectId) query = query.eq('project_id', filters.projectId)
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as AccessionWithProject[]
}

export async function getAccession(
  supabase: SupabaseClient,
  id: string
): Promise<(Accession & { project: Pick<Project, 'project_id' | 'title'> }) | null> {
  const { data, error } = await supabase
    .from('accessions')
    .select('*, project:projects(project_id, title)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Accession & { project: Pick<Project, 'project_id' | 'title'> }
}

// ---- Specimens ----

export async function getSpecimens(
  supabase: SupabaseClient,
  filters?: { accessionId?: string; specimenType?: string }
): Promise<SpecimenWithAccession[]> {
  let query = supabase
    .from('specimens')
    .select('*, accession:accessions(accession_id)')
    .order('created_at', { ascending: false })
  if (filters?.accessionId) query = query.eq('accession_id', filters.accessionId)
  if (filters?.specimenType) query = query.eq('specimen_type', filters.specimenType)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as SpecimenWithAccession[]
}

export async function getSpecimen(
  supabase: SupabaseClient,
  id: string
): Promise<(Specimen & { blocks: Block[]; slides: Slide[] }) | null> {
  const [specimenRes, blocksRes, slidesRes] = await Promise.all([
    supabase.from('specimens').select('*').eq('id', id).single(),
    supabase.from('blocks').select('*').eq('specimen_id', id).order('created_at'),
    supabase.from('slides').select('*').eq('specimen_id', id).order('section_number'),
  ])
  if (specimenRes.error) return null
  return {
    ...(specimenRes.data as Specimen),
    blocks: (blocksRes.data ?? []) as Block[],
    slides: (slidesRes.data ?? []) as Slide[],
  }
}

// ---- Slides ----

export async function getSlides(
  supabase: SupabaseClient,
  filters?: { specimenId?: string; stainStatus?: string }
): Promise<SlideWithSpecimen[]> {
  let query = supabase
    .from('slides')
    .select('*, specimen:specimens(specimen_id, tissue_abbreviation)')
    .order('created_at', { ascending: false })
  if (filters?.specimenId) query = query.eq('specimen_id', filters.specimenId)
  if (filters?.stainStatus) query = query.eq('stain_status', filters.stainStatus)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as SlideWithSpecimen[]
}

// ---- IHC Assay Development ----

export async function getIhcAssayProjects(
  supabase: SupabaseClient,
  projectId?: string
): Promise<IhcAssayProjectWithProject[]> {
  let query = supabase
    .from('ihc_assay_projects')
    .select('*, project:projects(project_id, title)')
    .order('created_at', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as IhcAssayProjectWithProject[]
}

export async function getIhcAssayProject(
  supabase: SupabaseClient,
  id: string
): Promise<AssayProjectFull | null> {
  const [assayRes, runsRes, controlsRes] = await Promise.all([
    supabase
      .from('ihc_assay_projects')
      .select('*, project:projects(project_id, title)')
      .eq('id', id)
      .single(),
    supabase
      .from('ihc_optimization_runs')
      .select('*')
      .eq('assay_project_id', id)
      .order('run_number'),
    supabase
      .from('ihc_controls')
      .select('*, accession:accessions(accession_id), inhouse:inhouse_library(library_id, cell_line, marker)')
      .eq('assay_project_id', id),
  ])
  if (assayRes.error) return null
  return {
    ...(assayRes.data as IhcAssayProject & { project: Pick<Project, 'project_id' | 'title'> }),
    runs: (runsRes.data ?? []) as AssayProjectFull['runs'],
    controls: (controlsRes.data ?? []) as AssayProjectFull['controls'],
  }
}

// ---- In-House Library ----

export async function getInhouseLibrary(supabase: SupabaseClient): Promise<InhouseLibrary[]> {
  const { data, error } = await supabase
    .from('inhouse_library')
    .select('*')
    .order('marker')
  if (error) throw error
  return data ?? []
}

// ---- Tissue Abbreviations ----

export async function getTissueAbbreviations(supabase: SupabaseClient): Promise<TissueAbbreviation[]> {
  const { data, error } = await supabase
    .from('tissue_abbreviations')
    .select('*')
    .order('organ_system')
  if (error) throw error
  return data ?? []
}

// ---- Dashboard ----

export async function getDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
  const [
    projectsRes, activeProjectsRes, accessionsRes, pendingAccessionsRes,
    specimensRes, slidesRes, unassignedSlidesRes, assaysRes,
  ] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('accessions').select('id', { count: 'exact', head: true }),
    supabase.from('accessions').select('id', { count: 'exact', head: true }).in('status', ['received', 'blocked']),
    supabase.from('specimens').select('id', { count: 'exact', head: true }),
    supabase.from('slides').select('id', { count: 'exact', head: true }),
    supabase.from('slides').select('id', { count: 'exact', head: true }).eq('stain_status', 'unassigned'),
    supabase.from('ihc_assay_projects').select('id', { count: 'exact', head: true }).eq('status', 'in_development'),
  ])
  return {
    totalProjects: projectsRes.count ?? 0,
    activeProjects: activeProjectsRes.count ?? 0,
    totalAccessions: accessionsRes.count ?? 0,
    pendingAccessions: pendingAccessionsRes.count ?? 0,
    totalSpecimens: specimensRes.count ?? 0,
    totalSlides: slidesRes.count ?? 0,
    unassignedSlides: unassignedSlidesRes.count ?? 0,
    inDevAssays: assaysRes.count ?? 0,
  }
}

export async function getRecentAccessions(
  supabase: SupabaseClient,
  limit = 8
): Promise<AccessionWithProject[]> {
  const { data, error } = await supabase
    .from('accessions')
    .select('*, project:projects(project_id, title)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as AccessionWithProject[]
}
