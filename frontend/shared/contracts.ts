export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'ASSESSED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'AWAITING_VERIFICATION';
export type Role = 'CITIZEN' | 'OFFICER' | 'OPERATOR' | 'ADMIN';
export interface Location { lat: number; lng: number; address: string }
export interface AIAnalysis { classification: string; confidence: number; severityScore: number; riskLevel: Severity; duplicateOf?: string | null; explanation: string[] }
export interface RiskAssessment { score: number; level: Severity; factors: string[] }
export interface DepartmentAssignment { department: string; recommendedAction: string; assignedOfficer?: string }
export interface TimelineEvent { state: IncidentStatus; timestamp: string; actor?: string; note?: string }
export interface Incident { id: string; citizenId: string; location: Location; media: { before: string[]; after: string[] }; aiAnalysis: AIAnalysis; department: string; status: IncidentStatus; timeline: TimelineEvent[]; description: string; createdAt: string }
export interface Prediction { id: string; location: Location; risk: Severity; horizon: string; factors: string[]; action: string }
export interface ResolutionVerification { confidence: number; status: 'AI_VERIFIED' | 'NEEDS_HUMAN_REVIEW'; beforeUrl: string; afterUrl: string }
export interface Notification { id: string; title: string; body: string; read: boolean }
