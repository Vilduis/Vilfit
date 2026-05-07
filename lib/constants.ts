export const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  remote: "Remoto",
  hybrid: "Híbrido",
}

export const JOB_STATUS_CONFIG = {
  active: {
    label: "Activa",
    accentClass: "bg-primary",
    chipClass: "border-primary/25 bg-primary/8 text-primary",
  },
  draft: {
    label: "Borrador",
    accentClass: "bg-muted-foreground/30",
    chipClass: "border-border text-muted-foreground",
  },
  closed: {
    label: "Cerrada",
    accentClass: "bg-destructive",
    chipClass: "border-destructive/25 bg-destructive/8 text-destructive",
  },
} as const

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  accepted: "Aceptado",
  rejected: "Rechazado",
}
