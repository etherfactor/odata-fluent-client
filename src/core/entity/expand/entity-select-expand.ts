export interface EntitySelectExpand {
  select: string[];
  expand: Record<string, EntitySelectExpand>;
}
