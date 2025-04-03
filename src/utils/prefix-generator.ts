export class PrefixGenerator {

  private index: number;

  constructor() {
    this.index = 0;
  }

  getPath(): string {
    const useIndex = this.index++;
    return `e${useIndex}`;
  }
}
