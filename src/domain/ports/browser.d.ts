interface Browser {
  getPageInfos(url: string): Promise<PageInfos>;
}

interface PageInfos {
  html: string;
  url: string;
}
