/**
 * Generates unique prefixes for any/all operations.
 */
export class PrefixGenerator {

  private index: number;

  constructor() {
    this.index = 0;
  }

  /**
   * Gets the next root path.
   * @returns The next root path.
   */
  getPath(): string {
    const useIndex = this.index++;
    return `e${useIndex}`;
  }
}
