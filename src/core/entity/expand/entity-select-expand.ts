/**
 * A basic listing of user-specified $select and $expand values.
 */
export interface EntitySelectExpand {
  /**
   * The properties being selected.
   */
  select: string[];
  /**
   * The properties being expanded, and their configuration.
   */
  expand: Record<string, EntitySelectExpand>;
}
