declare global {
  interface Window {
    URL: {
      createObjectURL(blob: Blob): string;
      revokeObjectURL(url: string): void;
    };
  }
}
