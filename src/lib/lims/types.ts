// =============================================
// PathxDx LIMS — TypeScript Types
// =============================================

export type AccessionStatus = 'received' | 'blocked' | 'slides_cut' | 'complete'
export type SpecimenType = 'mouse_tissue' | 'human_tissue' | 'cell_pellet'
export type StainStatus = 'unassigned' | 'assigned' | 'stained'
export type ProjectType = 'STANDARD' | 'IHC_DEV'
export type ProjectStatus = 'active' | 'completed' | 'on_hold'
export type AssayStatus = 'in_development' | 'approved' | 'locked'
export type RunOutcome = 'pass' | 'fail' | 'pending'
export type ControlType = 'client_supplied' | 'inhouse'
export type ExpressionRole = 'positive' | 'negative'
export type LabelType = 'direct_print' | 'adhesive'
export type CassetteLabelType = 'printed' | 'handwritten'
export type Sex = 'M' | 'F' | 'unknown'

// =============================================
// Row Types (mirror DB tables)
// =============================================

export interface Client {
  id: string
  name: string
  code: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface Project {
  id: string
  project_id: string
  title: string
  client_id: string
  pi_name: string | null
  study_type: string | null
  project_type: ProjectType
  species: string[]
  start_date: string | null
  end_date: string | null
  po_reference: string | null
  notes: string | null
  status: ProjectStatus
  created_at: string
}

export interface Accession {
  id: string
  accession_id: string
  project_id: string
  received_date: string
  received_by: string | null
  notes: string | null
  status: AccessionStatus
  is_control: boolean
  control_type: string | null
  created_at: string
}

export interface TissueAbbreviation {
  id: string
  abbreviation: string
  name: string
  organ_system: string | null
  requires_decal: boolean
  notes: string | null
  created_at: string
}

export interface Specimen {
  id: string
  specimen_id: string
  accession_id: string
  specimen_type: SpecimenType
  tissue_abbreviation: string | null
  status: string
  // Mouse tissue
  mouse_id: string | null
  strain: string | null
  sex: Sex | null
  collection_date: string | null
  day_post_treatment: number | null
  treatment_group: string | null
  cohort: string | null
  client_specimen_ids: Record<string, string> | null
  // Human tissue
  diagnosis: string | null
  fixation_method: string | null
  clinical_metadata: Record<string, unknown> | null
  // Cell pellet
  cell_line: string | null
  passage_number: number | null
  treatment: string | null
  pellet_count: number | null
  overexpressed_marker: string | null
  parent_cell_line: string | null
  notes: string | null
  created_at: string
}

export interface Block {
  id: string
  block_id: string
  specimen_id: string
  blocked_date: string | null
  blocked_by: string | null
  cassette_label_type: CassetteLabelType | null
  orientation_note: string | null
  notes: string | null
  created_at: string
}

export interface Slide {
  id: string
  slide_id: string
  specimen_id: string
  section_number: number | null
  cut_date: string | null
  cut_by: string | null
  label_type: LabelType | null
  stain_status: StainStatus
  stain_type: string | null
  marker: string | null
  isotype_control: string | null
  stained_date: string | null
  stained_by: string | null
  notes: string | null
  created_at: string
}

export interface IhcAssayProject {
  id: string
  project_id: string
  target_marker: string
  antibody_clone: string | null
  vendor: string | null
  catalogue_number: string | null
  status: AssayStatus
  locked_run_id: string | null
  created_at: string
}

export interface IhcOptimizationRun {
  id: string
  assay_project_id: string
  run_number: number
  ab_dilution: string | null
  antigen_retrieval: string | null
  secondary_system: string | null
  incubation_time_min: number | null
  incubation_temp: string | null
  blocking_conditions: string | null
  outcome: RunOutcome
  notes: string | null
  run_date: string | null
  created_at: string
}

export interface IhcControl {
  id: string
  assay_project_id: string
  control_type: ControlType
  accession_id: string | null
  inhouse_library_id: string | null
  role: ExpressionRole
  notes: string | null
}

export interface InhouseLibrary {
  id: string
  library_id: string
  cell_line: string
  marker: string
  expression_level: string | null
  role: ExpressionRole
  last_used_date: string | null
  notes: string | null
  created_at: string
}

// =============================================
// Insert Types (omit auto-generated fields)
// =============================================

export type ClientInsert = Omit<Client, 'id' | 'created_at'>
export type ProjectInsert = Omit<Project, 'id' | 'created_at'>
export type AccessionInsert = Omit<Accession, 'id' | 'created_at'>
export type SpecimenInsert = Omit<Specimen, 'id' | 'created_at'>
export type BlockInsert = Omit<Block, 'id' | 'created_at'>
export type SlideInsert = Omit<Slide, 'id' | 'created_at'>
export type IhcAssayProjectInsert = Omit<IhcAssayProject, 'id' | 'created_at'>
export type IhcOptimizationRunInsert = Omit<IhcOptimizationRun, 'id' | 'created_at'>
export type InhouseLibraryInsert = Omit<InhouseLibrary, 'id' | 'created_at'>

// =============================================
// Joined / Enriched Types for display
// =============================================

export interface ProjectWithClient extends Project {
  client: Pick<Client, 'name' | 'code'>
}

export interface AccessionWithProject extends Accession {
  project: Pick<Project, 'project_id' | 'title'>
}

export interface SpecimenWithAccession extends Specimen {
  accession: Pick<Accession, 'accession_id'>
}

export interface SlideWithSpecimen extends Slide {
  specimen: Pick<Specimen, 'specimen_id' | 'tissue_abbreviation'>
}

export interface IhcAssayProjectWithProject extends IhcAssayProject {
  project: Pick<Project, 'project_id' | 'title'>
}

export interface AssayProjectFull extends IhcAssayProject {
  project: Pick<Project, 'project_id' | 'title'>
  runs: IhcOptimizationRun[]
  controls: (IhcControl & {
    accession?: Pick<Accession, 'accession_id'> | null
    inhouse?: Pick<InhouseLibrary, 'library_id' | 'cell_line' | 'marker'> | null
  })[]
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalAccessions: number
  pendingAccessions: number
  totalSpecimens: number
  totalSlides: number
  unassignedSlides: number
  inDevAssays: number
}

export interface ActivityItem {
  id: string
  type: 'project' | 'accession' | 'specimen' | 'slide' | 'assay'
  action: string
  label: string
  ref_id: string
  created_at: string
}
